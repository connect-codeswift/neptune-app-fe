"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

export type SdsUploadDropzoneProps = Readonly<{
  fileName: string | null;
  onFileNameChange: (name: string | null) => void;
  className?: string;
}>;

export function SdsUploadDropzone(props: Readonly<SdsUploadDropzoneProps>) {
  const { fileName, onFileNameChange, className = "" } = props;
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

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileNameChange(file.name);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileNameChange(file ? file.name : null);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        "flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
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
        className="hidden"
        aria-label="SDS PDF file"
      />

      <Icon
        icon="mdi:tray-arrow-up"
        className="text-ehs-muted-text size-7"
        aria-hidden="true"
      />

      <Text as="p" className="text-ehs-darker text-[14px] font-bold">
        {fileName ? fileName : "Drop SDS PDF here or click to browse"}
      </Text>

      <Text as="p" className="text-ehs-muted-text text-[12px]">
        {fileName
          ? "Selected — click to replace"
          : "Accepts PDF files up to 50 MB"}
      </Text>

      <Button
        type="button"
        variant="secondary"
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
