"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  CLOUDINARY_MAX_BYTES,
  CLOUDINARY_MAX_FILES,
  formatFileSize,
} from "@/lib/cloudinary-constants";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import type { PhotoFieldConfig } from "./types";

export type PhotoUploadControlProps = Readonly<{
  field: PhotoFieldConfig;
  /** Secure Cloudinary URLs already attached to this field. */
  value: string[];
  error?: string;
  onChange: (urls: string[]) => void;
}>;

/** Dashed drop-zone that uploads images to Cloudinary and previews the
 * returned secure URLs. The field value is the list of those URLs. */
export function PhotoUploadControl(props: PhotoUploadControlProps) {
  const { field, value, error, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const maxFiles = field.maxFiles ?? CLOUDINARY_MAX_FILES;
  const isUploading = pendingCount > 0;

  const addFiles = async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setUploadError(null);

    const images = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length === 0) {
      setUploadError("Only image files can be attached.");
      return;
    }

    const oversized = images.find((file) => file.size > CLOUDINARY_MAX_BYTES);
    if (oversized) {
      setUploadError(
        `${oversized.name} is larger than ${formatFileSize(CLOUDINARY_MAX_BYTES)}.`,
      );
      return;
    }

    const room = maxFiles - value.length;
    if (room <= 0) {
      setUploadError(`You can attach up to ${String(maxFiles)} photos.`);
      return;
    }

    const accepted = images.slice(0, room);
    setPendingCount((count) => count + accepted.length);

    const results = await Promise.allSettled(
      accepted.map((file) => uploadFileToCloudinary(file)),
    );

    const uploaded = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value.secureUrl);
    const failure = results.find((result) => result.status === "rejected");

    setPendingCount((count) => count - accepted.length);
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    if (failure) {
      setUploadError(
        failure.reason instanceof Error
          ? failure.reason.message
          : "Upload failed. Please try again.",
      );
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const message = error ?? uploadError;

  return (
    <div className="flex cursor-pointer flex-col gap-1.5">
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
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors",
          isDragging
            ? "border-ehs-normal-blue bg-ehs-normal-blue/5"
            : message
              ? "border-ehs-red/60"
              : "hover:border-ehs-normal-blue/60 hover:bg-ehs-light-bg/40 border-slate-900/10",
        ].join(" ")}
      >
        <Icon
          icon={isUploading ? "mdi:loading" : "mdi:camera-outline"}
          className={[
            "text-ehs-muted-text size-8",
            isUploading ? "animate-spin" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
        <span className="text-ehs-gray text-base">
          {isUploading
            ? `Uploading ${String(pendingCount)} photo${pendingCount === 1 ? "" : "s"}...`
            : (field.placeholder ?? "Attach Photo Evidence")}
        </span>
        {field.helperText ? (
          <span className="text-ehs-muted-text text-xs">
            {field.helperText}
          </span>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {value.length > 0 ? (
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
                    : "border-ehs-border flex min-w-[12rem] flex-1 items-center gap-3 rounded-[10px] border bg-white/50 p-3"
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
                    <span className="text-ehs-dark-bg min-w-0 flex-1 truncate text-base font-semibold">
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

      {message ? <p className="text-ehs-red text-xs">{message}</p> : null}
    </div>
  );
}
