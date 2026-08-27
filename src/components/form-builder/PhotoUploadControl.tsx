"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import type { FileModule } from "@/dtos/req/files-request.dto";
import {
  FILE_ALLOWED_MIME_TYPES,
  FILE_MAX_FILES,
  formatFileSize,
  getFileMaxBytes,
  isLegacyPublicUrl,
  isPdfMimeType,
  isStoredFileId,
} from "@/lib/files";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import { uploadFile } from "@/lib/upload-file";
import type { PhotoFieldConfig } from "./types";

const DOC_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const PPT_MIME_TYPES = [
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const FILES_MIME_TYPES = [
  ...FILE_ALLOWED_MIME_TYPES,
  ...DOC_MIME_TYPES,
] as const;

const CLOUDINARY_FILES_MIME_TYPES = [
  ...FILES_MIME_TYPES,
  ...PPT_MIME_TYPES,
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export type PhotoUploadControlProps = Readonly<{
  field: PhotoFieldConfig;
  /** Stored fileIds, Cloudinary secure URLs, or legacy public URLs. */
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
    const ref = parts[parts.length - 1]?.trim() ?? "";
    // Testing only for http dropped an encoded id to the bare branch below, which renders
    // the whole "name|||size|||uuid" string as the filename.
    if (isLegacyPublicUrl(ref) || isStoredFileId(ref)) {
      const title =
        parts[0]?.trim() ||
        (isStoredFileId(ref) ? "File" : fileNameFromUrl(ref));
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

/** Dashed drop-zone. Default is files-API `fileId`s; `storage: "cloudinary"` stores the secure URL. */
export function PhotoUploadControl(props: PhotoUploadControlProps) {
  const { field, value, error, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [metaByUrl, setMetaByUrl] = useState<Record<string, FileMeta>>({});

  const acceptMode = field.accept ?? "image";
  const isPdf = acceptMode === "pdf";
  const isFiles = acceptMode === "files";
  const isFileLike = isFiles || isPdf;
  const listVariant = field.listVariant ?? (isFileLike ? "rows" : "grid");
  const fileModule: FileModule = field.fileModule ?? "Document";
  const useCloudinary = field.storage === "cloudinary";
  const storeFileName = field.storeFileName === true;
  const maxFiles = field.maxFiles ?? FILE_MAX_FILES;
  const maxBytes = field.maxBytes ?? getFileMaxBytes(fileModule);
  const isUploading = pendingCount > 0;

  const addFiles = async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setUploadError(null);

    const candidates = Array.from(incoming);
    const acceptedTypes = isFiles
      ? useCloudinary
        ? (CLOUDINARY_FILES_MIME_TYPES as readonly string[])
        : (FILES_MIME_TYPES as readonly string[])
      : null;

    const filtered = candidates.filter((file) => {
      if (isPdf) {
        return isPdfMimeType(file.type);
      }
      if (acceptedTypes) {
        return (
          acceptedTypes.includes(file.type) ||
          file.type.startsWith("image/") ||
          (useCloudinary && file.type.startsWith("video/"))
        );
      }
      return file.type.startsWith("image/");
    });

    if (filtered.length === 0) {
      setUploadError(
        isPdf
          ? "Only PDF files can be attached."
          : isFiles
            ? useCloudinary
              ? "Only images, PDF, DOC, PPT, or video files can be attached."
              : "Only JPG, PNG, PDF, or DOC files can be attached."
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
        `You can attach up to ${String(maxFiles)} ${isFileLike ? "file" : "photo"}${maxFiles === 1 ? "" : "s"}.`,
      );
      return;
    }

    const accepted = filtered.slice(0, room);
    setPendingCount((count) => count + accepted.length);

    const results = await Promise.allSettled(
      accepted.map((file) =>
        useCloudinary
          ? uploadFileToCloudinary(file)
          : uploadFile(file, { module: fileModule }),
      ),
    );

    const uploaded = results.flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      const item = result.value;
      const ref = "secureUrl" in item ? item.secureUrl : item.fileId;
      // metaByUrl below is local state and is lost on submit, so the name rides along.
      const storedId = storeFileName
        ? `${item.name}|||${item.sizeLabel}|||${ref}`
        : ref;
      return [{ storedId, name: item.name, sizeLabel: item.sizeLabel }];
    });
    const failure = results.find((result) => result.status === "rejected");

    setPendingCount((count) => count - accepted.length);

    if (uploaded.length > 0) {
      setMetaByUrl((current) => {
        const next = { ...current };
        for (const item of uploaded) {
          next[item.storedId] = {
            name: item.name,
            sizeLabel: item.sizeLabel,
          };
        }
        return next;
      });
      onChange([...value, ...uploaded.map((item) => item.storedId)]);
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
  const acceptAttr = isPdf
    ? "application/pdf"
    : isFiles
      ? useCloudinary
        ? "image/*,application/pdf,.doc,.docx,.ppt,.pptx,video/mp4,video/quicktime,video/webm"
        : "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-colors",
          isFileLike ? "min-h-32.75 gap-2 py-6" : "gap-2 py-7",
          isDragging
            ? "border-ehs-normal-blue bg-ehs-normal-blue/5"
            : message
              ? "border-ehs-red/60"
              : isFileLike
                ? "border-ehs-border-ink/10 hover:border-ehs-border-ink/18 hover:bg-ehs-surface-inverse/2"
                : "hover:border-ehs-normal-blue/60 hover:bg-ehs-light-bg/40 border-ehs-border",
        ].join(" ")}
      >
        <Icon
          icon={
            isUploading
              ? "mdi:loading"
              : isPdf
                ? "mdi:file-pdf-box-outline"
                : isFiles
                  ? "mdi:tray-arrow-up"
                  : "mdi:camera-outline"
          }
          className={[
            "size-8",
            isFileLike ? "text-ehs-gray" : "text-ehs-muted-text",
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
              isFileLike ? "text-ehs-slate" : "text4 text-ehs-gray font-normal",
            ].join(" ")}
          >
            {isUploading
              ? `Uploading ${String(pendingCount)} ${isFileLike ? "file" : "photo"}${pendingCount === 1 ? "" : "s"}...`
              : (field.placeholder ??
                (isPdf
                  ? "Drop a PDF here or click to browse"
                  : isFiles
                    ? "Drop files here or click to upload"
                    : "Attach Photo Evidence"))}
          </span>
          {field.helperText ? (
            <Text as="span" className="text8 text-ehs-muted-text leading-4">
              {field.helperText}
            </Text>
          ) : null}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={maxFiles > 1}
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
                className="group rounded-2.5 bg-ehs-form-classes-bg/70 flex items-center gap-3 py-3 pr-3 pl-3"
              >
                <span className="rounded-2.5 text-ehs-normal-blue bg-ehs-normal-blue/20 inline-flex size-9 shrink-0 items-center justify-center">
                  <Icon
                    icon="mdi:file-document-outline"
                    className="size-5"
                    aria-hidden
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text4 text-ehs-slate truncate leading-5">
                    {name}
                  </p>
                  {subtitle ? (
                    <p className="text8 text-ehs-muted-text truncate leading-4">
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
            const isUrl = isLegacyPublicUrl(entry);
            const canPreview = isUrl || isStoredFileId(entry);
            const fileName = isUrl
              ? (entry.split("/").pop()?.split("?")[0] ?? entry)
              : entry;

            return (
              <li
                key={`${entry}-${String(index)}`}
                className={
                  canPreview
                    ? "group border-ehs-border-ink/10 relative size-28 overflow-hidden rounded-xl border"
                    : "border-ehs-border rounded-2.5 bg-ehs-surface/50 flex min-w-48 flex-1 items-center gap-3 border p-3"
                }
              >
                {canPreview ? (
                  <ResolvedFileImage
                    fileRef={entry}
                    alt={`Attached photo ${String(index + 1)}`}
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
                    canPreview
                      ? "bg-ehs-border-ink/60 hover:bg-ehs-border-ink/80 absolute top-1 right-1 rounded-full p-0.5 text-white transition-colors"
                      : "text-ehs-muted-text hover:text-ehs-red border-ehs-border bg-ehs-surface/60 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors"
                  }
                >
                  <Icon
                    icon="mdi:close"
                    className={canPreview ? "size-3.5" : "size-2.5"}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {message ? (
        <Text as="p" className="text8 text-ehs-red">
          {message}
        </Text>
      ) : null}
    </div>
  );
}
