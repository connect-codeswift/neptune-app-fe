"use client";

import {
  useId,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  CLOUDINARY_MAX_BYTES,
  formatFileSize,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";

const ACCEPT = "application/pdf,.pdf";

export type UploadDocumentDropzoneProps = Readonly<{
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string | null;
  isUploading?: boolean;
  uploadedLabel?: string | null;
  className?: string;
}>;

function isPdfFile(file: File): boolean {
  return isPdfMimeType(file.type) || file.name.toLowerCase().endsWith(".pdf");
}

/**
 * PDF drag-and-drop zone (Figma 5568:24716).
 * Validates PDF-only + Cloudinary size limit; parent uploads to Cloudinary.
 */
export function UploadDocumentDropzone(
  props: Readonly<UploadDocumentDropzoneProps>,
) {
  const {
    file,
    onFileChange,
    error = null,
    isUploading = false,
    uploadedLabel = null,
    className = "",
  } = props;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const applyFile = (next: File | null) => {
    if (isUploading) {
      return;
    }
    setLocalError(null);
    if (!next) {
      onFileChange(null);
      return;
    }
    if (!isPdfFile(next)) {
      setLocalError("Only PDF files are allowed.");
      onFileChange(null);
      return;
    }
    if (next.size > CLOUDINARY_MAX_BYTES) {
      setLocalError("File must be 50MB or smaller.");
      onFileChange(null);
      return;
    }
    onFileChange(next);
  };

  const onDrag = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isUploading) {
      return;
    }
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (isUploading) {
      return;
    }
    const dropped = event.dataTransfer.files?.[0] ?? null;
    applyFile(dropped);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const message = error ?? localError;
  const sizeLabel = file ? formatFileSize(file.size) : null;

  return (
    <div className={["w-full min-w-0", className].filter(Boolean).join(" ")}>
      <label
        htmlFor={inputId}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        aria-disabled={isUploading || undefined}
        className={[
          "flex min-h-35 w-full flex-col items-center justify-center rounded-4 border-[1.6px] border-dashed px-4 py-6 transition-colors sm:min-h-42.75 sm:px-8 sm:py-8 lg:min-h-50 lg:py-10",
          isUploading
            ? "cursor-wait border-[#0891a6] bg-[rgba(8,145,166,0.06)]"
            : "cursor-pointer",
          !isUploading && dragActive
            ? "border-[#0891a6] bg-[rgba(8,145,166,0.06)]"
            : "",
          !isUploading && !dragActive
            ? "border-[rgba(15,23,42,0.1)] bg-transparent hover:border-[rgba(8,145,166,0.45)] hover:bg-[rgba(8,145,166,0.03)]"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          disabled={isUploading}
          className="sr-only"
          onChange={onChange}
        />
        <Icon
          icon={isUploading ? "mdi:loading" : "mdi:cloud-upload-outline"}
          className={[
            "text-ehs-muted-text size-10 sm:size-12",
            isUploading ? "text-ehs-normal-blue animate-spin" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
        {isUploading ? (
          <Text
            as="p"
            className="text4 text-ehs-slate mt-2 max-w-full px-1 text-center sm:mt-3"
          >
            Uploading to Cloudinary…
          </Text>
        ) : file ? (
          <p className="text4 text-ehs-slate mt-2 line-clamp-2 max-w-full px-1 text-center break-all sm:mt-3">
            {file.name}
          </p>
        ) : (
          <>
            <Text
              as="p"
              className="text4 text-ehs-slate mt-2 max-w-full px-1 text-center sm:hidden"
            >
              Tap to upload *
            </Text>
            <Text
              as="p"
              className="text4 text-ehs-slate mt-3 hidden max-w-full px-1 text-center sm:block"
            >
              Drag & drop or click to upload *
            </Text>
          </>
        )}
        <Text
          as="p"
          className="text8 text-ehs-muted-text mt-1 text-center"
        >
          {file && sizeLabel
            ? `${sizeLabel} · PDF${uploadedLabel ? ` · ${uploadedLabel}` : ""}`
            : "PDF — Max 50MB"}
        </Text>
        {file && !isUploading ? (
          <button
            type="button"
            className="text8 text-ehs-normal-blue relative z-1 mt-3 font-semibold hover:underline"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              applyFile(null);
            }}
          >
            Remove file
          </button>
        ) : null}
      </label>
      {message ? (
        <Text as="p" className="text8 text-ehs-red mt-2">
          {message}
        </Text>
      ) : null}
    </div>
  );
}
