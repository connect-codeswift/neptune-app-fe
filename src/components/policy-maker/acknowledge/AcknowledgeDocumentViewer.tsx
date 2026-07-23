"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { acknowledgePdfFileName } from "@/components/policy-maker/acknowledge/acknowledge-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type AcknowledgeDocumentViewerProps = Readonly<{
  document: PolicyDocument;
  pageCount?: number;
  className?: string;
}>;

/**
 * PDF preview panel (Figma 5568:25391).
 */
export function AcknowledgeDocumentViewer(
  props: Readonly<AcknowledgeDocumentViewerProps>,
) {
  const { document, pageCount = 14, className = "" } = props;
  const [page, setPage] = useState(2);
  const fileName = acknowledgePdfFileName(document);
  const versionNum = document.version.replace(/^v/i, "");

  const goPrev = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(pageCount, current + 1));

  return (
    <div
      className={[
        "relative flex min-h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] lg:min-h-[722px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-[43px] shrink-0 items-center gap-2 border-b border-[rgba(15,23,42,0.08)] px-3 sm:px-4">
        <Icon
          icon="mdi:file-pdf-box"
          className="size-3.5 shrink-0 text-[#ef4444]"
          aria-hidden="true"
        />
        <Text
          as="span"
          className="min-w-0 truncate text-[12px] font-bold text-[#0b1320]"
        >
          {fileName}
        </Text>
        <Text
          as="span"
          className="hidden shrink-0 text-[10px] text-[#8892a3] sm:inline"
        >
          {`· ${String(pageCount)} pages`}
        </Text>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Search in document"
            className="inline-flex items-center rounded-[10px] border border-[rgba(15,23,42,0.14)] px-[9px] py-[5px] text-[#566072] transition-colors hover:bg-white/70"
          >
            <Icon icon="mdi:magnify" className="size-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            onClick={goPrev}
            disabled={page <= 1}
            className="inline-flex items-center rounded-[10px] border border-[rgba(15,23,42,0.14)] px-[9px] py-[5px] text-[#566072] transition-colors hover:bg-white/70 disabled:opacity-40"
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-3"
              aria-hidden="true"
            />
          </button>
          <Text
            as="span"
            className="min-w-[40px] text-center text-[11px] text-[#566072]"
          >
            {`${String(page)} / ${String(pageCount)}`}
          </Text>
          <button
            type="button"
            aria-label="Next page"
            onClick={goNext}
            disabled={page >= pageCount}
            className="inline-flex items-center rounded-[10px] border border-[rgba(15,23,42,0.14)] px-[9px] py-[5px] text-[#566072] transition-colors hover:bg-white/70 disabled:opacity-40"
          >
            <Icon
              icon="mdi:chevron-right"
              className="size-3"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-auto bg-[rgba(255,255,255,0.62)] px-4 pt-8 pb-10 sm:px-8 sm:pt-12 lg:px-12">
        <article className="relative w-full max-w-[540px] rounded bg-white px-5 pt-10 pb-14 shadow-[0px_8px_32px_-8px_rgba(15,23,42,0.16)] sm:px-10 sm:pt-12 sm:pb-[62px] lg:px-14">
          <Text
            as="p"
            className="text-[9px] leading-[15.3px] font-bold tracking-[1.26px] text-[#8892a3] uppercase"
          >
            {`Standard Operating Procedure · ${document.code}`}
          </Text>
          <Text
            as="h3"
            className="mt-1 text-[18px] leading-[34px] font-bold text-[#0b1320] sm:text-[20px]"
          >
            {document.title}
          </Text>
          <Text
            as="p"
            className="text-[10px] leading-[17px] text-[#566072]"
          >
            {`Version ${versionNum} · ${document.status.toUpperCase()} · Effective date: pending approval`}
          </Text>

          <Text
            as="h4"
            className="mt-[19px] text-[13px] leading-[22.1px] font-bold text-[#0b1320]"
          >
            2. Pre-operation inspection
          </Text>
          <p className="mt-1 text-[10.8px] leading-[18.7px] text-[#0b1320]">
            {`Before each shift, the operator shall perform a documented visual inspection of the press as detailed in checklist ${document.code}-A. Key inspection points include:`}
          </p>
          <ul className="mt-1.5 list-disc space-y-0 pl-[16.5px] text-[11px] leading-[18.7px] text-[#0b1320]">
            <li>Hydraulic hose condition — chafing, kinks, bulges at couplings</li>
            <li>Pressure gauge — operating within 2,500 – 2,900 psi range</li>
            <li>Guarding — all panels secured, interlocks functional</li>
            <li>Emergency stop — confirmed responsive via pre-shift test</li>
            <li>{`Work area — free of debris, fluids, obstructions within 36"`}</li>
          </ul>

          <Text
            as="h4"
            className="mt-5 text-[13px] leading-[22.1px] font-bold text-[#0b1320]"
          >
            3. Operating procedure
          </Text>
          <ol className="mt-1 list-decimal space-y-0 pl-5 text-[11px] leading-[18.7px] text-[#0b1320]">
            <li>Verify LOTO is cleared and the machine is released for production.</li>
            <li>Confirm die setup matches the job traveler and press capacity.</li>
            <li>Cycle the press once empty to confirm smooth travel and return.</li>
            <li>Begin production only after supervisor sign-off for the shift.</li>
          </ol>

          <Text
            as="p"
            className="absolute right-6 bottom-6 text-[9px] leading-[15.3px] text-[#b3bbc8] sm:right-10"
          >
            {`Page ${String(page)} of ${String(pageCount)} · Neptune Doc Control`}
          </Text>
        </article>
      </div>
    </div>
  );
}
