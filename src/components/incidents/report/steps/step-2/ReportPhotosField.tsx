"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Text } from "@/components/Text";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import {
  ReportFieldError,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import type { ReportPhotoFile } from "@/forms/incident-module/index";
import {
  FILE_MAX_FILES,
  getFileMaxBytes,
  isAllowedMimeType,
  isLegacyPublicUrl,
  isPdfMimeType,
  isStoredFileId,
} from "@/lib/files";
import { uploadFile } from "@/lib/upload-file";

const INCIDENT_MAX_BYTES = getFileMaxBytes("Incident");

export type ReportPhotosFieldProps = Readonly<{
  photos: readonly ReportPhotoFile[];
  onChange: (photos: readonly ReportPhotoFile[]) => void;
  className?: string;
}>;

function truncateName(name: string, max = 10): string {
  if (name.length <= max) {
    return name;
  }
  return `${name.slice(0, max - 1)}…`;
}

function AttachmentTile(
  props: Readonly<{
    file: ReportPhotoFile;
    onRemove: () => void;
  }>,
) {
  const { file, onRemove } = props;
  const isPdf = file.kind === "pdf" || file.format === "pdf";
  const rawSrc = file.previewUrl || file.secureUrl || file.url;
  const showImage = !isPdf && Boolean(rawSrc);

  return (
    <div className="rounded-2.5 border-ehs-border-ink/8 relative size-22 shrink-0 overflow-hidden border bg-[linear-gradient(135deg,#446580_0%,#223349_100%)]">
      {showImage && file.previewUrl?.startsWith("blob:") ? (
        <Image
          src={file.previewUrl}
          alt={file.name}
          fill
          unoptimized
          className="object-cover"
          sizes="88px"
        />
      ) : showImage &&
        rawSrc &&
        (isLegacyPublicUrl(rawSrc) || isStoredFileId(rawSrc)) ? (
        <ResolvedFileImage
          fileRef={rawSrc}
          alt={file.name}
          sizes="88px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[linear-gradient(135deg,#3b4f66_0%,#1c2a3d_100%)] px-1.5">
          <Icon
            icon={isPdf ? "mdi:file-pdf-box" : "mdi:image-outline"}
            className="text-ehs-light-text/90 size-7"
            aria-hidden="true"
          />
          {!file.isUploading ? (
            <span className="text-ehs-light-text/80 text-xs font-semibold tracking-wide uppercase">
              {isPdf ? "PDF" : "FILE"}
            </span>
          ) : null}
        </div>
      )}

      {file.isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <Icon
            icon="mdi:loading"
            className="text-ehs-light-text size-5 animate-spin"
            aria-hidden="true"
          />
        </div>
      ) : null}

      {file.error ? (
        <div className="bg-ehs-red/80 absolute inset-0 flex items-center justify-center px-1">
          <span className="text-ehs-light-text text-center text-xs leading-tight">
            Failed
          </span>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-1.5 pt-4 pb-0.5">
        <div className="flex items-end justify-between gap-1">
          <span className="text-ehs-light-text/90 truncate text-xs">
            {truncateName(file.name)}
          </span>
          <span className="text-ehs-light-text/85 shrink-0 text-xs">
            {file.sizeLabel}
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        disabled={file.isUploading}
        className="rounded-2.25 text-ehs-light-text absolute top-1 right-1 inline-flex size-4.5 items-center justify-center bg-black/50 transition hover:bg-black/70 disabled:opacity-50"
      >
        <Icon icon="mdi:close" className="size-2.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ReportPhotosField(props: Readonly<ReportPhotosFieldProps>) {
  const { photos = [], onChange, className = "" } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  /**
   * Rejection reasons shown under the field rather than in a toast. These are answers about
   * this input — too many files, wrong type, too large — so they belong beside it, where the
   * reporter is already looking and where they stay put instead of timing out. Upload
   * failures from the server keep their toast: that is not a fact about the field.
   */
  const [fileErrors, setFileErrors] = useState<readonly string[]>([]);

  const openPicker = () => {
    if (photos.length >= FILE_MAX_FILES) {
      setFileErrors([`You can upload up to ${String(FILE_MAX_FILES)} files.`]);
      return;
    }
    setFileErrors([]);
    inputRef.current?.click();
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const remaining = FILE_MAX_FILES - photos.length;
    if (remaining <= 0) {
      setFileErrors([`You can upload up to ${String(FILE_MAX_FILES)} files.`]);
      return;
    }

    const selected = Array.from(fileList).slice(0, remaining);
    const validFiles: File[] = [];
    // Collected rather than shown one at a time: picking five files at once used to fire
    // five toasts that stacked and expired before they could all be read.
    const rejected: string[] = [];

    for (const file of selected) {
      if (!isAllowedMimeType(file.type)) {
        rejected.push(`${file.name}: use JPG, PNG, WEBP, GIF, or PDF.`);
        continue;
      }
      if (file.size > INCIDENT_MAX_BYTES) {
        rejected.push(`${file.name}: exceeds the 25 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setFileErrors(rejected);

    if (validFiles.length === 0) {
      return;
    }

    const placeholders: ReportPhotoFile[] = validFiles.map((file) => {
      const isPdf = isPdfMimeType(file.type);
      return {
        id: `pending-${file.name}-${String(file.lastModified)}-${String(Math.random())}`,
        name: file.name.replace(/\.[^.]+$/, "") || file.name,
        sizeLabel:
          file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        bytes: file.size,
        mimeType: file.type,
        kind: isPdf ? "pdf" : "image",
        previewUrl: isPdf ? undefined : URL.createObjectURL(file),
        isUploading: true,
      };
    });

    let nextPhotos: ReportPhotoFile[] = [...photos, ...placeholders];
    onChange(nextPhotos);
    setIsUploading(true);

    try {
      for (let index = 0; index < validFiles.length; index += 1) {
        const file = validFiles[index];
        const placeholder = placeholders[index];

        try {
          const uploaded = await uploadFile(file, { module: "Incident" });
          const originalName = file.name.trim() || uploaded.name;
          nextPhotos = nextPhotos.map((item) =>
            item.id === placeholder.id
              ? {
                  id: uploaded.fileId,
                  publicId: uploaded.fileId,
                  name: originalName,
                  sizeLabel: uploaded.sizeLabel,
                  bytes: uploaded.bytes,
                  url: uploaded.fileId,
                  secureUrl: uploaded.fileId,
                  mimeType: uploaded.mimeType,
                  format: uploaded.format,
                  resourceType: uploaded.resourceType,
                  kind: uploaded.kind,
                  previewUrl: placeholder.previewUrl,
                  isUploading: false,
                }
              : item,
          );
          onChange(nextPhotos);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed.";
          toast.error(`${file.name}: ${message}`);
          nextPhotos = nextPhotos.map((item) =>
            item.id === placeholder.id
              ? { ...item, isUploading: false, error: message }
              : item,
          );
          onChange(nextPhotos);
        }
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={["flex flex-col gap-1.5 py-4.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ReportFieldLabel
        label="Photos & files"
        trailing={
          <Text as="span" className="text-ehs-muted-text text-xs">
            Up to 10 files, 25 MB each. Images or PDF.
          </Text>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
        }}
      />

      <div className="flex flex-wrap gap-2.5">
        {photos.map((photo) => (
          <AttachmentTile
            key={photo.id}
            file={photo}
            onRemove={() => {
              if (photo.previewUrl) {
                URL.revokeObjectURL(photo.previewUrl);
              }
              onChange(photos.filter((item) => item.id !== photo.id));
            }}
          />
        ))}

        <button
          type="button"
          onClick={openPicker}
          disabled={isUploading || photos.length >= FILE_MAX_FILES}
          className="hover:border-ehs-normal-blue/40 hover:bg-ehs-normal-blue/5 rounded-2.5 border-ehs-border-ink/14 bg-ehs-surface/62 flex size-22 shrink-0 flex-col items-center justify-center gap-1.25 border border-dashed transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            icon={isUploading ? "mdi:loading" : "mdi:plus"}
            className={[
              "text-ehs-gray size-4",
              isUploading ? "animate-spin" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />
          <Text as="span" className="text-ehs-gray text-xs">
            {isUploading ? "Uploading" : "Add file"}
          </Text>
        </button>
      </div>

      {fileErrors.length > 0 ? (
        <div className="flex flex-col gap-0.5" data-field-error="true">
          {fileErrors.map((message) => (
            <ReportFieldError key={message}>{message}</ReportFieldError>
          ))}
        </div>
      ) : null}
    </div>
  );
}
