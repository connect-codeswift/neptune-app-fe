"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";

const ACCEPTED = "image/*";

export type PhotoEvidenceFieldProps = Readonly<{
  onChange?: (files: File[]) => void;
}>;

/** Dashed drop-zone for attaching photo evidence to a hazard report. */
export function PhotoEvidenceField(props: PhotoEvidenceFieldProps) {
  const { onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const updateFiles = (next: File[]) => {
    setFiles(next);
    onChange?.(next);
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const images = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length > 0) updateFiles([...files, ...images]);
  };

  const removeFile = (index: number) => {
    updateFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5">
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
          addFiles(event.dataTransfer.files);
        }}
        className={[
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors",
          isDragging
            ? "border-ehs-normal-blue bg-ehs-normal-blue/5"
            : "border-slate-900/10 hover:border-ehs-normal-blue/60 hover:bg-ehs-light-bg/40",
        ].join(" ")}
      >
        <Icon
          icon="mdi:camera-outline"
          className="text-ehs-muted-text size-8"
          aria-hidden="true"
        />
        <span className="text-ehs-gray text-sm">Attach Photo Evidence</span>
        <span className="text-ehs-muted-text text-xs">
          Photos greatly improve resolution speed
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {files.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="bg-ehs-light-bg/40 flex items-center gap-2 rounded-[10px] px-3 py-2"
            >
              <Icon
                icon="mdi:image-outline"
                className="text-ehs-muted-text size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="text-ehs-dark-bg min-w-0 flex-1 truncate text-sm">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-ehs-muted-text hover:text-ehs-red transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <Icon icon="mdi:close" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
