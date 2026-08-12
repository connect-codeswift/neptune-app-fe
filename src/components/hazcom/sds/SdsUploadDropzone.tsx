"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

export type SdsUploadDropzoneProps = Readonly<{
  fileName: string | null;
  /** Receives the picked File so the caller can upload it, or null to clear. */
  onFileChange: (file: File | null) => void;
  /** Blocks re-picking while the caller is uploading. */
  disabled?: boolean;
  className?: string;
}>;

export function SdsUploadDropzone(props: Readonly<SdsUploadDropzoneProps>) {
  const { fileName, onFileChange, disabled = false, className = "" } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      }}
      className={[
        "flex min-h-47.5 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
        dragActive
          ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light"
          : "border-ehs-border bg-white/50 hover:bg-white/80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        aria-label="SDS PDF file"
      />

      <Icon
        icon="mdi:tray-arrow-up"
        className="text-ehs-muted-text size-7"
        aria-hidden="true"
      />

      <Text as="p" className="text5 text-ehs-darker">
        {fileName ? fileName : "Drop SDS PDF here or click to browse"}
      </Text>

      <Text as="p" className="text8 text-ehs-muted-text">
        {fileName
          ? "Selected — click to replace"
          : "Accepts PDF files up to 50 MB"}
      </Text>

      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
        className="mt-1"
      >
        Browse Files
      </Button>
    </div>
  );
}
