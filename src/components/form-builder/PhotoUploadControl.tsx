"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  CLOUDINARY_ALLOWED_MIME_TYPES,
  CLOUDINARY_MAX_BYTES,
  CLOUDINARY_MAX_FILES,
  formatFileSize,
} from "@/lib/cloudinary-constants";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import type { PhotoFieldConfig } from "./types";

const DOC_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const FILES_MIME_TYPES = [
  ...CLOUDINARY_ALLOWED_MIME_TYPES,
  ...DOC_MIME_TYPES,
] as const;

export type PhotoUploadControlProps = Readonly<{
  field: PhotoFieldConfig;
  /** Secure Cloudinary URLs already attached to this field. */
  value: string[];
  error?: string;
  onChange: (urls: string[]) => void;
}>;

type FileMeta = Readonly<{
  name: string;
  sizeLabel: string;
}>;

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").pop() ?? "";
    return decodeURIComponent(last.split("?")[0] ?? last) || "file";
  } catch {
    return url.split("/").pop()?.split("?")[0] || "file";
  }
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
}

/** Parse a photo row value: URL, `title|||subtitle`, or `title|||subtitle|||url`. */
function parsePhotoRowEntry(
  entry: string,
  metaByUrl: Record<string, FileMeta>,
): Readonly<{ name: string; subtitle: string | null }> {
  const meta = metaByUrl[entry];
  if (meta) {
    return {
      name: meta.name,
      subtitle: `${meta.sizeLabel} · Uploaded just now`,
    };
  }

  const parts = entry.split("|||");
  if (parts.length >= 3) {
    const url = parts[parts.length - 1]?.trim() ?? "";
    if (/^https?:\/\//i.test(url)) {
      const title = parts[0]?.trim() || fileNameFromUrl(url);
      const subtitle = parts.slice(1, -1).join("|||").trim();
      return { name: title, subtitle: subtitle || null };
    }
  }

  if (parts.length === 2 && !/^https?:\/\//i.test(entry)) {
    return {
      name: parts[0]?.trim() || entry,
      subtitle: parts[1]?.trim() || null,
    };
  }

  if (/^https?:\/\//i.test(entry)) {
    return { name: fileNameFromUrl(entry), subtitle: null };
  }

  return { name: entry, subtitle: null };
}

/** Dashed drop-zone that uploads to Cloudinary and lists the returned secure URLs. */
export function PhotoUploadControl(props: PhotoUploadControlProps) {
  const { field, value, error, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [metaByUrl, setMetaByUrl] = useState<Record<string, FileMeta>>({});

  const acceptMode = field.accept ?? "image";
  const isFiles = acceptMode === "files";
  const listVariant = field.listVariant ?? (isFiles ? "rows" : "grid");
  const maxFiles = field.maxFiles ?? CLOUDINARY_MAX_FILES;
  const maxBytes = field.maxBytes ?? CLOUDINARY_MAX_BYTES;
  const isUploading = pendingCount > 0;

  const addFiles = async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setUploadError(null);

    const candidates = Array.from(incoming);
    const acceptedTypes = isFiles
      ? (FILES_MIME_TYPES as readonly string[])
      : null;

    const filtered = candidates.filter((file) => {
      if (acceptedTypes) {
        return (
          acceptedTypes.includes(file.type) || file.type.startsWith("image/")
        );
      }
      return file.type.startsWith("image/");
    });

    if (filtered.length === 0) {
      setUploadError(
        isFiles
          ? "Only JPG, PNG, PDF, or DOC files can be attached."
          : "Only image files can be attached.",
      );
      return;
    }

    const oversized = filtered.find((file) => file.size > maxBytes);
    if (oversized) {
      setUploadError(
        `${oversized.name} is larger than ${formatFileSize(maxBytes)}.`,
      );
      return;
    }

    const room = maxFiles - value.length;
    if (room <= 0) {
      setUploadError(
        `You can attach up to ${String(maxFiles)} ${isFiles ? "files" : "photos"}.`,
      );
      return;
    }

    const accepted = filtered.slice(0, room);
    setPendingCount((count) => count + accepted.length);

    const results = await Promise.allSettled(
      accepted.map((file) => uploadFileToCloudinary(file)),
    );

    const uploaded = results.flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      return [result.value];
    });
    const failure = results.find((result) => result.status === "rejected");

    setPendingCount((count) => count - accepted.length);

    if (uploaded.length > 0) {
      setMetaByUrl((current) => {
        const next = { ...current };
        for (const item of uploaded) {
          next[item.secureUrl] = {
            name: item.name,
            sizeLabel: item.sizeLabel,
          };
        }
        return next;
      });
      onChange([...value, ...uploaded.map((item) => item.secureUrl)]);
    }

    if (failure) {
      setUploadError(
        failure.reason instanceof Error
          ? failure.reason.message
          : "Upload failed. Please try again.",
      );
    }
  };

  const removeAt = (index: number) => {
    const removed = value[index];
    if (removed) {
      setMetaByUrl((current) => {
        const next = { ...current };
        delete next[removed];
        return next;
      });
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const message = error ?? uploadError;
  const acceptAttr = isFiles
    ? "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : "image/*";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={[
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed px-6 text-center transition-colors",
          isFiles ? "min-h-32.75 gap-2 py-6" : "gap-2 py-7",
          isDragging
            ? "border-ehs-normal-blue bg-ehs-normal-blue/5"
            : message
              ? "border-ehs-red/60"
              : isFiles
                ? "border-[rgba(15,23,42,0.1)] hover:border-[rgba(15,23,42,0.18)] hover:bg-[rgba(15,23,42,0.02)]"
                : "hover:border-ehs-normal-blue/60 hover:bg-ehs-light-bg/40 border-slate-900/10",
        ].join(" ")}
      >
        <Icon
          icon={
            isUploading
              ? "mdi:loading"
              : isFiles
                ? "mdi:tray-arrow-up"
                : "mdi:camera-outline"
          }
          className={[
            "size-8",
            isFiles ? "text-[#566072]" : "text-ehs-muted-text",
            isUploading ? "animate-spin" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
        <span className="flex flex-col items-center gap-1">
          <span
            className={[
              "text4 leading-5 font-medium",
              isFiles ? "text-[#2a3446]" : "text4 text-ehs-gray font-normal",
            ].join(" ")}
          >
            {isUploading
              ? `Uploading ${String(pendingCount)} ${isFiles ? "file" : "photo"}${pendingCount === 1 ? "" : "s"}...`
              : (field.placeholder ??
                (isFiles
                  ? "Drop files here or click to upload"
                  : "Attach Photo Evidence"))}
          </span>
          {field.helperText ? (
            <span className="text8 leading-4 text-[#8892a3]">
              {field.helperText}
            </span>
          ) : null}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {value.length > 0 && listVariant === "rows" ? (
        <ul className="flex flex-col gap-2">
          {value.map((entry, index) => {
            const { name, subtitle } = parsePhotoRowEntry(entry, metaByUrl);

            return (
              <li
                key={`${entry}-${String(index)}`}
                className="group flex items-center gap-3 rounded-2.5 bg-[rgba(238,241,246,0.7)] py-3 pr-3 pl-3"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2.5 bg-[rgba(8,145,166,0.2)] text-[#0891a6]">
                  <Icon
                    icon="mdi:file-document-outline"
                    className="size-5"
                    aria-hidden
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text4 truncate leading-5 text-[#2a3446]">
                    {name}
                  </p>
                  {subtitle ? (
                    <p className="text8 truncate leading-4 text-[#8892a3]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Remove ${name}`}
                  className="text-ehs-muted-text hover:text-ehs-red inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Icon icon="mdi:close" className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {value.length > 0 && listVariant === "grid" ? (
        <ul className="mt-1 flex flex-wrap gap-2">
          {value.map((entry, index) => {
            const isUrl = /^https?:\/\//i.test(entry);
            const fileName = isUrl
              ? (entry.split("/").pop()?.split("?")[0] ?? entry)
              : entry;

            return (
              <li
                key={`${entry}-${String(index)}`}
                className={
                  isUrl
                    ? "group relative size-28 overflow-hidden rounded-xl border border-slate-900/10"
                    : "border-ehs-border flex min-w-48 flex-1 items-center gap-3 rounded-2.5 border bg-white/50 p-3"
                }
              >
                {isUrl ? (
                  <Image
                    src={entry}
                    alt={`Attached photo ${String(index + 1)}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <span
                      className="bg-ehs-normal-blue/10 flex size-8 shrink-0 items-center justify-center rounded-lg"
                      aria-hidden="true"
                    >
                      <Icon
                        icon="lucide:image"
                        className="text-ehs-normal-blue size-4"
                      />
                    </span>
                    <span className="text4 text-ehs-darker min-w-0 flex-1 truncate font-semibold">
                      {fileName}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Remove photo ${String(index + 1)}`}
                  className={
                    isUrl
                      ? "absolute top-1 right-1 rounded-full bg-slate-900/60 p-0.5 text-white transition-colors hover:bg-slate-900/80"
                      : "text-ehs-muted-text hover:text-ehs-red flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-900/5 bg-white/60 transition-colors"
                  }
                >
                  <Icon
                    icon="mdi:close"
                    className={isUrl ? "size-3.5" : "size-2.5"}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {message ? <p className="text8 text-ehs-red">{message}</p> : null}
    </div>
  );
}
