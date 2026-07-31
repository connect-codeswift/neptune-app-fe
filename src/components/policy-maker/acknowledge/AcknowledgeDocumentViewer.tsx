"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { documentFileName } from "@/components/policy-maker/edit/edit-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

const AcknowledgePdfDocument = dynamic(
  () =>
    import(
      "@/components/policy-maker/acknowledge/AcknowledgePdfDocument"
    ).then((module) => module.AcknowledgePdfDocument),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex min-h-[420px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] lg:min-h-[722px]">
        <div className="flex flex-col items-center justify-center gap-2 text-[13px] text-[#566072]">
          <Icon
            icon="mdi:loading"
            className="size-6 animate-spin text-[#0891a6]"
            aria-hidden="true"
          />
          <span>Loading PDF viewer…</span>
        </div>
      </div>
    ),
  },
);

export type AcknowledgeDocumentViewerProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

/**
 * PDF preview panel for Read & Acknowledge (Figma 5568:25391).
 * Loads the actual PDF renderer client-side only and passes the real uploaded
 * file URL (`document.filePath`). Shows a placeholder when no file is available.
 */
export function AcknowledgeDocumentViewer(
  props: Readonly<AcknowledgeDocumentViewerProps>,
) {
  const { document, className = "" } = props;
  const fileUrl = document.filePath;
  const fileName = documentFileName(document);

  if (!fileUrl) {
    return (
      <div
        className={[
          "relative flex min-h-[420px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] px-6 text-center shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] lg:min-h-[722px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon="mdi:file-alert-outline"
          className="size-8 text-[#8892a3]"
          aria-hidden="true"
        />
        <Text as="p" className="mt-2 text-[13px] font-semibold text-[#0b1320]">
          Preview unavailable
        </Text>
        <Text as="p" className="max-w-[320px] text-[12px] text-[#8892a3]">
          This document has no file URL on record yet.
        </Text>
      </div>
    );
  }

  return (
    <div className={className}>
      <AcknowledgePdfDocument fileUrl={fileUrl} fileName={fileName} />
    </div>
  );
}
