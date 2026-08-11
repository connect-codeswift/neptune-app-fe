"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type EditDocumentFileCardProps = Readonly<{
  fileName: string;
  fileMeta: string;
  onReplaceFile: (file: File) => void;
  className?: string;
}>;

/**
 * Current-file strip with Replace File (Figma 5568:25827).
 */
export function EditDocumentFileCard(
  props: Readonly<EditDocumentFileCardProps>,
) {
  const { fileName, fileMeta, onReplaceFile, className = "" } = props;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (next) {
      onReplaceFile(next);
    }
    event.target.value = "";
  };

  return (
    <div
      className={[
        "flex w-full min-w-0 flex-col gap-3 rounded-[12px] border-[1.5px] border-dashed border-[rgba(15,23,42,0.1)] bg-[rgba(238,241,246,0.45)] p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex shrink-0 items-start rounded-lg bg-[rgba(11,19,32,0.1)] p-2">
          <Icon
            icon="mdi:file-document-outline"
            className="size-6 text-[#566072]"
            aria-hidden="true"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text
            as="p"
            className="text-3.5 truncate font-semibold text-[#0b1320]"
          >
            {fileName}
          </Text>
          <Text as="p" className="text-[12px] text-[#8892a3]">
            {fileMeta}
          </Text>
        </div>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[rgba(11,19,32,0.1)] bg-white px-4 text-[13px] font-semibold whitespace-nowrap text-[#0891a6] transition-colors hover:bg-[rgba(8,145,166,0.06)]"
      >
        Replace File
      </button>
    </div>
  );
}
