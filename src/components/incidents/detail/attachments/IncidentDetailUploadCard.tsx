"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import { isAllowedMimeType } from "@/lib/cloudinary-constants";
import { toast } from "@/lib/toast";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type IncidentDetailUploadCardProps = Readonly<{
  onUploadSuccess: (item: AttachmentItem) => void;
  className?: string;
}>;

export function IncidentDetailUploadCard(
  props: Readonly<IncidentDetailUploadCardProps>,
) {
  const { onUploadSuccess, className = "" } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

      // Determine kind
      let kind: "image" | "video" | "pdf" = "pdf";
      if (result.resourceType === "video") kind = "video";
      else if (result.kind === "image") kind = "image";

      const newItem: AttachmentItem = {
        id: result.id,
        name: file.name,
        description: `Uploaded document - ${file.name.replace(/\.[^.]+$/, "")}`,
        sizeLabel: result.sizeLabel,
        bytes: result.bytes,
        addedBy: "Sarah Mitchell", // Mock current user
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        secureUrl: result.secureUrl,
        kind,
      };

      onUploadSuccess(newItem);
      toast.success(
        "Upload Successful",
        `File "${file.name}" uploaded successfully.`,
      );
    } catch (error: unknown) {
      toast.error(
        "Upload Failed",
        (error as Error).message || "Failed to upload file to Cloudinary.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <IncidentGlassCard paddingClassName="p-4 sm:p-5" className={className}>
      <div className="mb-2.5 flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-2.5">
        <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
          Upload
        </Text>
        <span className="text-ehs-muted-text text-[11px]">
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
            ? "border-ehs-normal-blue bg-ehs-normal-blue/8"
            : "border-[rgba(15,23,42,0.12)] bg-white/42 hover:border-[rgba(15,23,42,0.22)] hover:bg-white/80",
          isUploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Icon
              icon="mdi:loading"
              className="size-8 animate-spin text-[#0891a6]"
            />
            <span className="text-ehs-dark-bg text-[11.5px] font-bold">
              Uploading...
            </span>
          </div>
        ) : (
          <>
            <div className="bg-ehs-normal-blue/14 text-ehs-normal-blue flex size-[34px] shrink-0 items-center justify-center rounded-full">
              <Icon icon="mdi:plus" className="size-5" />
            </div>
            <span className="text-ehs-dark-bg mt-2.5 text-[13px] font-bold">
              Drop files here
            </span>
            <span className="text-ehs-muted-text mt-1 text-[10px]">
              JPG, PNG, MP4, PDF up to 50 MB
            </span>
            <span className="mt-3.5 text-[11.5px] font-bold text-[#056e7e] transition-colors hover:text-[#067485]">
              Browse files
            </span>
          </>
        )}
      </div>
    </IncidentGlassCard>
  );
}
