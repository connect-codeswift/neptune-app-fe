"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Text } from "@/components/Text";
import { ReportFieldLabel } from "@/components/incidents/report/shared/ReportFormField";
import type { ReportPhotoFile } from "@/components/incidents/report/shared/report-incident-data";
import {
  stripAttachmentDisplayName,
  withAttachmentDisplayName,
} from "@/lib/attachment-url";
import {
  CLOUDINARY_MAX_BYTES,
  CLOUDINARY_MAX_FILES,
  isAllowedMimeType,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";

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
  const rawSrc = file.secureUrl ?? file.url ?? file.previewUrl;
  const imageSrc = rawSrc
    ? rawSrc.startsWith("blob:")
      ? rawSrc
      : stripAttachmentDisplayName(rawSrc)
    : undefined;
  const showImage = !isPdf && Boolean(imageSrc);

  return (
    <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,#446580_0%,#223349_100%)]">
      {showImage ? (
        <Image
          src={imageSrc!}
          alt={file.name}
          fill
          unoptimized
          className="object-cover"
          sizes="88px"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[linear-gradient(135deg,#3b4f66_0%,#1c2a3d_100%)] px-1.5">
          <Icon
            icon={isPdf ? "mdi:file-pdf-box" : "mdi:image-outline"}
            className="size-7 text-white/90"
            aria-hidden="true"
          />
          {!file.isUploading ? (
            <span className="text-[9px] font-semibold tracking-wide text-white/80 uppercase">
              {isPdf ? "PDF" : "FILE"}
            </span>
          ) : null}
        </div>
      )}

      {file.isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <Icon
            icon="mdi:loading"
            className="size-5 animate-spin text-white"
            aria-hidden="true"
          />
        </div>
      ) : null}

      {file.error ? (
        <div className="bg-ehs-red/80 absolute inset-0 flex items-center justify-center px-1">
          <span className="text-center text-[9px] leading-tight text-white">
            Failed
          </span>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-0.5">
        <div className="flex items-end justify-between gap-1">
          <span className="truncate text-[9px] text-white/90">
            {truncateName(file.name)}
          </span>
          <span className="shrink-0 text-[9px] text-white/85">
            {file.sizeLabel}
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        disabled={file.isUploading}
        className="absolute top-1 right-1 inline-flex size-[18px] items-center justify-center rounded-[9px] bg-black/50 text-white transition hover:bg-black/70 disabled:opacity-50"
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

  const openPicker = () => {
    if (photos.length >= CLOUDINARY_MAX_FILES) {
      toast.error(
        `You can upload up to ${String(CLOUDINARY_MAX_FILES)} files.`,
      );
      return;
    }
    inputRef.current?.click();
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const remaining = CLOUDINARY_MAX_FILES - photos.length;
    if (remaining <= 0) {
      toast.error(
        `You can upload up to ${String(CLOUDINARY_MAX_FILES)} files.`,
      );
      return;
    }

    const selected = Array.from(fileList).slice(0, remaining);
    const validFiles: File[] = [];

    for (const file of selected) {
      if (!isAllowedMimeType(file.type)) {
        toast.error(`${file.name}: use JPG, PNG, WEBP, GIF, or PDF.`);
        continue;
      }
      if (file.size > CLOUDINARY_MAX_BYTES) {
        toast.error(`${file.name}: exceeds the 50 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

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
          const uploaded = await uploadFileToCloudinary(file);
          const originalName = file.name.trim() || uploaded.name;
          const secureUrl = withAttachmentDisplayName(
            uploaded.secureUrl,
            originalName,
          );
          nextPhotos = nextPhotos.map((item) =>
            item.id === placeholder.id
              ? {
                  id: uploaded.id,
                  publicId: uploaded.publicId,
                  name: originalName,
                  sizeLabel: uploaded.sizeLabel,
                  bytes: uploaded.bytes,
                  url: withAttachmentDisplayName(
                    uploaded.url || uploaded.secureUrl,
                    originalName,
                  ),
                  secureUrl,
                  mimeType: uploaded.mimeType,
                  format: uploaded.format,
                  resourceType: uploaded.resourceType,
                  kind: uploaded.kind,
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
        } finally {
          if (placeholder.previewUrl) {
            URL.revokeObjectURL(placeholder.previewUrl);
          }
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
      className={["flex flex-col gap-1.5 py-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ReportFieldLabel
        label="Photos & files"
        trailing={
          <Text as="span" className="text-ehs-muted-text text-[10px]">
            Up to 10 files, 50 MB each. Images or PDF.
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
          disabled={isUploading || photos.length >= CLOUDINARY_MAX_FILES}
          className="hover:border-ehs-normal-blue/40 hover:bg-ehs-normal-blue/5 flex size-[88px] shrink-0 flex-col items-center justify-center gap-[5px] rounded-[10px] border border-dashed border-[rgba(15,23,42,0.14)] bg-white/62 transition disabled:cursor-not-allowed disabled:opacity-50"
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
          <Text as="span" className="text-ehs-gray text-[10.8px]">
            {isUploading ? "Uploading" : "Add file"}
          </Text>
        </button>
      </div>
    </div>
  );
}
