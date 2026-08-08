"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { withAttachmentDisplayName } from "@/lib/attachment-url";
import { getAuthDisplayName } from "@/lib/auth-context";
import { isAllowedMimeType } from "@/lib/cloudinary-constants";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { toast } from "@/lib/toast";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type IncidentDetailUploadCardProps = Readonly<{
  onUploadSuccess: (item: AttachmentItem) => void | Promise<void>;
  /** Registers a function that opens the native file picker. */
  onRegisterOpen?: (open: () => void) => void;
  className?: string;
}>;

export function IncidentDetailUploadCard(
  props: Readonly<IncidentDetailUploadCardProps>,
) {
  const { onUploadSuccess, onRegisterOpen, className = "" } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    onRegisterOpen?.(() => {
      fileInputRef.current?.click();
    });

    // Replace the registration on unmount so the parent isn't left holding a
    // closure over this component's detached file input.
    return () => {
      onRegisterOpen?.(() => undefined);
    };
  }, [onRegisterOpen]);

  const handleUploadFile = async (file: File) => {
    if (!isAllowedMimeType(file.type)) {
      toast.error(
        "Unsupported file",
        "Please upload JPG, PNG, WEBP, GIF, MP4, or PDF.",
      );
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Uploading file...", "Transferring to Cloudinary server.");
      const result = await uploadFileToCloudinary(file);

      let kind: "image" | "video" | "pdf" = "pdf";
      if (result.resourceType === "video") {
        kind = "video";
      } else if (result.kind === "pdf" || result.resourceType === "raw") {
        kind = "pdf";
      } else if (result.kind === "image") {
        kind = "image";
      }

      const originalName = file.name.trim() || result.name;
      const newItem: AttachmentItem = {
        id: result.id,
        name: originalName,
        description:
          kind === "pdf" ? "Document" : kind === "video" ? "Video" : "Photo",
        sizeLabel: result.sizeLabel,
        bytes: result.bytes,
        addedBy: getAuthDisplayName(),
        time: formatShortDateTime(new Date()),
        secureUrl: withAttachmentDisplayName(result.secureUrl, originalName),
        kind,
      };

      await onUploadSuccess(newItem);
      toast.success(
        "Upload saved",
        `File "${file.name}" was uploaded and saved to this incident.`,
      );
    } catch (error: unknown) {
      toast.error(
        "Upload Failed",
        getMutationErrorMessage(
          error,
          (error as Error).message || "Failed to upload file to Cloudinary.",
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      void handleUploadFile(event.target.files[0]);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) {
      void handleUploadFile(event.dataTransfer.files[0]);
    }
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-[14px]"
      className={className}
    >
      <div className="flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Upload
        </Text>
        <span className="text-sm leading-normal text-ehs-muted-text">
          Drag & drop or browse
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.pdf"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          "relative flex min-h-[174px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-6 text-center transition-all",
          dragActive
            ? "border-ehs-normal-blue bg-[rgba(8,145,166,0.08)]"
            : "border-[rgba(15,23,42,0.12)] bg-[rgba(255,255,255,0.42)] hover:border-[rgba(15,23,42,0.22)] hover:bg-white/80",
          isUploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Icon
              icon="mdi:loading"
              className="size-8 animate-spin text-ehs-normal-blue"
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-ehs-dark-bg">
              Uploading...
            </span>
          </div>
        ) : (
          <>
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[rgba(8,145,166,0.14)] text-ehs-dark-blue">
              <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
            </div>
            <span className="mt-2.5 text-sm font-bold text-ehs-dark-bg">
              Drop files here
            </span>
            <span className="mt-1 text-xs text-ehs-muted-text">
              JPG, PNG, MP4, PDF up to 50 MB
            </span>
            <span className="mt-3.5 text-sm font-bold text-ehs-dark-blue">
              Browse files
            </span>
          </>
        )}
      </div>
    </IncidentGlassCard>
  );
}
