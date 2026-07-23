"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import type { VersionHistoryCardModel } from "@/components/policy-maker/version-history/version-history-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type VersionDocumentPreviewModalProps = Readonly<{
  policyDocument: PolicyDocument;
  entry: VersionHistoryCardModel;
  onClose: () => void;
  onDownload?: () => void;
  pageCount?: number;
}>;

/**
 * Document preview modal opened from Version History eye action.
 * Visual language matches Acknowledge PDF viewer (Figma 5568:25391).
 */
export function VersionDocumentPreviewModal(
  props: Readonly<VersionDocumentPreviewModalProps>,
) {
  const { policyDocument, entry, onClose, onDownload, pageCount = 14 } = props;
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);

  const versionNum = entry.version.replace(/^v/i, "");
  const fileName = `${policyDocument.id.toUpperCase()}_${policyDocument.title
    .split(/[-–—]/)[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 20)}_v${versionNum}.pdf`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1320]/50 p-3 backdrop-blur-[4px] sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.92)] shadow-[0px_25px_50px_-12px_rgba(15,23,42,0.35)]"
      >
        <header className="flex shrink-0 flex-col gap-3 border-b border-[rgba(15,23,42,0.08)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0 pr-10 sm:pr-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text
                as="h2"
                id={titleId}
                className="font-mono text-[16px] leading-6 font-bold text-[#0b1320]"
              >
                {entry.version}
              </Text>
              {entry.isCurrent ? (
                <span className="inline-flex h-5 items-center rounded bg-[rgba(11,19,32,0.14)] px-2 py-0.5 text-[12px] leading-4 text-[#566072]">
                  Current
                </span>
              ) : (
                <span className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full bg-[rgba(86,96,114,0.1)] pr-2.5 pl-2">
                  <span className="size-1.5 shrink-0 rounded-[3px] bg-[#8892a3]" />
                  <span className="text-[11px] font-semibold tracking-[0.11px] text-[#2a3446]">
                    {entry.status === "review" ? "In review" : "Superseded"}
                  </span>
                </span>
              )}
            </div>
            <Text
              as="p"
              className="mt-0.5 truncate text-[12px] leading-[18px] text-[#8892a3]"
            >
              {policyDocument.title}
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={onDownload}
              className="h-9 rounded-[10px] border-[0.8px] border-[rgba(11,19,32,0.14)] px-3 text-[13px] font-medium text-[#0b1320] !shadow-none"
            >
              <Icon
                icon="mdi:download-outline"
                className="size-4"
                aria-hidden="true"
              />
              Download
            </Button>
            <button
              type="button"
              aria-label="Close preview"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(15,23,42,0.1)] bg-white text-[#566072] transition-colors hover:bg-[#eef1f6] sm:static sm:size-9"
            >
              <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

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
              aria-label="Previous page"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
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
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
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

        <div className="min-h-0 flex-1 overflow-auto bg-[#eef1f6]/70 px-4 py-8 sm:px-8 sm:py-10">
          <article className="relative mx-auto w-full max-w-[540px] rounded bg-white px-5 pt-10 pb-14 shadow-[0px_8px_32px_-8px_rgba(15,23,42,0.16)] sm:px-10 sm:pt-12 sm:pb-[62px]">
            <Text
              as="p"
              className="text-[9px] leading-[15.3px] font-bold tracking-[1.26px] text-[#8892a3] uppercase"
            >
              {`Standard Operating Procedure · ${policyDocument.code}`}
            </Text>
            <Text
              as="h3"
              className="mt-1 text-[18px] leading-[34px] font-bold text-[#0b1320] sm:text-[20px]"
            >
              {policyDocument.title}
            </Text>
            <Text
              as="p"
              className="text-[10px] leading-[17px] text-[#566072]"
            >
              {`Version ${versionNum} · ${entry.isCurrent ? "CURRENT" : "ARCHIVED"} · ${entry.publishedAt}`}
            </Text>

            <Text
              as="h4"
              className="mt-[19px] text-[13px] leading-[22.1px] font-bold text-[#0b1320]"
            >
              Version notes
            </Text>
            <Text
              as="p"
              className="mt-1 text-[11px] leading-[18.7px] text-[#0b1320]"
            >
              {entry.changeLog}
            </Text>

            <Text
              as="h4"
              className="mt-5 text-[13px] leading-[22.1px] font-bold text-[#0b1320]"
            >
              2. Pre-operation inspection
            </Text>
            <p className="mt-1 text-[10.8px] leading-[18.7px] text-[#0b1320]">
              {`Before each shift, the operator shall perform a documented visual inspection as detailed in checklist ${policyDocument.code}-A.`}
            </p>
            <ul className="mt-1.5 list-disc space-y-0 pl-[16.5px] text-[11px] leading-[18.7px] text-[#0b1320]">
              <li>Hydraulic hose condition — chafing, kinks, bulges at couplings</li>
              <li>Pressure gauge — operating within 2,500 – 2,900 psi range</li>
              <li>Guarding — all panels secured, interlocks functional</li>
              <li>Emergency stop — confirmed responsive via pre-shift test</li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-[18px] text-[#8892a3]">
              <span>{`Author: ${entry.authorFullName}`}</span>
              <span>{`Published: ${entry.publishedAt}`}</span>
            </div>

            <Text
              as="p"
              className="absolute right-6 bottom-6 text-[9px] leading-[15.3px] text-[#b3bbc8] sm:right-10"
            >
              {`Page ${String(page)} of ${String(pageCount)} · Neptune Doc Control`}
            </Text>
          </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}
