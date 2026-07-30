"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PolicyMakerDocumentDetailHeader } from "@/components/policy-maker/detail/PolicyMakerDocumentDetailHeader";
import {
  acknowledgmentPercent,
  documentDisplayStatus,
} from "@/components/policy-maker/policy-maker-data";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { VersionDocumentPreviewModal } from "@/components/policy-maker/version-history/VersionDocumentPreviewModal";
import { toVersionHistoryCard } from "@/components/policy-maker/version-history/version-history-utils";
import { toast } from "@/lib/toast";

export type PolicyMakerDocumentDetailViewProps = Readonly<{
  document: PolicyDocument;
  onVersionHistory?: () => void;
  onApproval?: () => void;
  onAcknowledgment?: () => void;
  onApprovals?: () => void;
  onDateRangeClick?: () => void;
  onNotificationsClick?: () => void;
}>;

/** Glass card shell matching Figma 5568:24604 (16px radius, 0.8 border, soft shadow). */
const detailCardClass =
  "relative overflow-hidden rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

function DetailField(props: Readonly<{ label: string; children: ReactNode }>) {
  const { label, children } = props;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text-[12px] leading-4 text-[#8892a3]">
        {label}
      </Text>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Document Detail View (Figma 5568:24538 / 53. Document Detail View).
 * AppShell owns the sidebar — this renders MainWorkspace content only.
 */
export function PolicyMakerDocumentDetailView(
  props: Readonly<PolicyMakerDocumentDetailViewProps>,
) {
  const {
    document,
    onVersionHistory,
    onApproval,
    onAcknowledgment,
    onApprovals,
    onDateRangeClick,
    onNotificationsClick,
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const ackPercent = acknowledgmentPercent(document);

  const previewEntry = useMemo(() => {
    const current =
      document.versions.find((entry) => entry.badge === "current") ??
      document.versions[0];

    if (current) {
      return toVersionHistoryCard(current);
    }

    return toVersionHistoryCard({
      version: document.version,
      author: document.owner,
      authorFullName: document.ownerFullName,
      date: document.updated,
      publishedAt: document.reviewDate || document.updated,
      badge: "current",
      changeLog: `Current controlled revision of ${document.title}.`,
    });
  }, [document]);
  const displayStatus = documentDisplayStatus(document.status);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Top toolbar — stacks on mobile, row from sm up */}
      <header className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:py-[22px]">
        <div className="relative w-full min-w-0 sm:max-w-[280px] sm:flex-1 lg:w-[280px] lg:max-w-none lg:flex-none">
          <Icon
            icon="mdi:magnify"
            className="pointer-events-none absolute top-1/2 left-3 size-[14.6px] -translate-y-1/2 text-[#8892a3]"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search incidents, actions, docs…"
            aria-label="Search"
            className="w-full rounded-[9.73px] border-[0.973px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] py-[9px] pr-12 pl-9 text-[12px] text-[#0b1320] shadow-sm backdrop-blur-[4.865px] outline-none placeholder:text-[#8892a3] focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-[3.892px] border-[0.973px] border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.62)] px-[6.8px] py-[2.9px] text-[10px] text-[#566072] sm:inline">
            ⌘K
          </kbd>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:justify-end sm:gap-[14px]">
          <button
            type="button"
            onClick={onDateRangeClick}
            className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-[9.73px] border-[0.973px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] px-3 py-2 text-[12px] font-bold text-[#0b1320] shadow-sm backdrop-blur-[5.838px] transition-colors hover:bg-white/80 sm:flex-none sm:gap-[7.8px] sm:px-[14.6px] sm:py-[8.8px]"
          >
            <Icon
              icon="mdi:calendar-outline"
              className="size-[14.6px] shrink-0 text-[#566072]"
              aria-hidden="true"
            />
            <span className="truncate">
              <span className="sm:hidden">Mar 25 — Apr 24</span>
              <span className="hidden sm:inline">
                March 25 — April 24, 2026
              </span>
            </span>
            <Icon
              icon="mdi:chevron-down"
              className="ml-auto size-[12.6px] shrink-0 text-[#566072] sm:ml-0"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={onNotificationsClick}
            className="relative inline-flex shrink-0 items-center rounded-[9.73px] border-[0.973px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] px-2.5 py-2 shadow-sm backdrop-blur-[5.838px] transition-colors hover:bg-white/80 sm:px-[10.7px] sm:py-[8.8px]"
          >
            <Icon
              icon="mdi:bell-outline"
              className="size-[15.6px] text-[#0b1320]"
              aria-hidden="true"
            />
            <span
              className="absolute top-1.5 right-1.5 size-[6.8px] rounded-[3.4px] border-[1.946px] border-[#eef1f6] bg-[#ef4444]"
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-[14px] sm:px-4 sm:pb-8">
        <PolicyMakerDocumentDetailHeader
          document={document}
          onVersionHistory={onVersionHistory}
          onApproval={onApproval}
          onAcknowledgment={onAcknowledgment}
        />

        {/* Preview + Details | Acknowledgment — fluid grid (Figma 5568:24604) */}
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,2.0fr)_minmax(240px,1fr)] lg:items-center lg:gap-7">
          <div className="flex min-w-0 flex-col gap-5">
            {/* File preview */}
            <article className={`${detailCardClass} min-w-0`}>
              <div className="relative z-1 flex flex-col gap-4 p-4 sm:p-[20.2px]">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(11,19,32,0.14)] sm:size-12">
                    <Icon
                      icon="mdi:file-document-outline"
                      className="size-5 text-[#566072] sm:size-6"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Text
                      as="p"
                      className="truncate text-[15px] leading-6 font-semibold text-[#0b1320] sm:text-[16px]"
                    >
                      {document.title}
                    </Text>
                    <Text
                      as="p"
                      className="text-[13px] leading-5 text-[#566072] sm:text-[14px]"
                    >
                      {`${document.fileType} · ${document.fileSize}`}
                    </Text>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="relative inline-flex h-[38px] w-fit max-w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0891a6] px-4 text-[14px] leading-5 font-medium whitespace-nowrap text-white shadow-[0px_5.838px_17.514px_-5.838px_#0891a6] transition-colors before:pointer-events-none before:absolute before:inset-0 before:rounded-[9.73px] before:shadow-[inset_0px_0.973px_0px_0.973px_rgba(255,255,255,0.25)] before:content-[''] hover:bg-[#078196]"
                >
                  <Icon
                    icon="mdi:eye-outline"
                    className="relative z-1 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="relative z-1 whitespace-nowrap">
                    Preview Document
                  </span>
                </button>
              </div>
            </article>

            {/* Document Details */}
            <article
              className={`${detailCardClass} flex min-w-0 flex-col gap-4 p-4 sm:px-[20.8px] sm:py-[20.8px]`}
            >
              <Text
                as="h2"
                className="relative z-1 text-[16px] leading-7 font-semibold text-[#0b1320] sm:text-[18px] sm:leading-[27px]"
              >
                Document Details
              </Text>
              <div className="relative z-1 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                <DetailField label="Category">
                  <Text as="p" className="text-[14px] leading-5 text-[#0b1320]">
                    {document.documentKind}
                  </Text>
                </DetailField>
                <DetailField label="Version">
                  <Text as="p" className="text-[14px] leading-5 text-[#0b1320]">
                    {document.version}
                  </Text>
                </DetailField>
                <DetailField label="Status">
                  <span className="inline-flex h-[21.7px] items-center gap-[5px] rounded-full bg-[rgba(11,19,32,0.14)] px-2.5">
                    <span
                      className="size-1.5 shrink-0 rounded-[3px] bg-[#566072]"
                      aria-hidden="true"
                    />
                    <Text
                      as="span"
                      className="text-[11px] leading-[15.7px] font-semibold tracking-[0.11px] text-[#566072]"
                    >
                      {displayStatus}
                    </Text>
                  </span>
                </DetailField>
                <DetailField label="Owner">
                  <Text
                    as="p"
                    className="truncate text-[14px] leading-5 text-[#0b1320]"
                  >
                    {document.ownerFullName}
                  </Text>
                </DetailField>
                <DetailField label="Department">
                  <Text as="p" className="text-[14px] leading-5 text-[#0b1320]">
                    {document.department}
                  </Text>
                </DetailField>
                <DetailField label="Review Date">
                  <Text as="p" className="text-[14px] leading-5 text-[#0b1320]">
                    {document.reviewDate}
                  </Text>
                </DetailField>
              </div>
            </article>
          </div>

          {/* Acknowledgment */}
          <div className="flex min-w-0 flex-col lg:self-start">
            <article className={`${detailCardClass} w-full min-w-0`}>
              <div className="relative z-1 flex flex-col gap-3 p-4 sm:gap-0 sm:px-5 sm:pt-5 sm:pb-5">
                <Text
                  as="h2"
                  className="text-[16px] leading-7 font-semibold text-[#0b1320] sm:text-[18px] sm:leading-[27px]"
                >
                  Acknowledgment Status
                </Text>
                <div className="flex flex-col items-stretch sm:mt-3">
                  <Text
                    as="p"
                    className="text-center text-[26px] leading-9 font-bold text-[#0b1320] sm:text-[30px]"
                  >
                    {`${String(ackPercent)}%`}
                  </Text>
                  <Text
                    as="p"
                    className="text-center text-[12px] leading-4 text-[#566072]"
                  >
                    {`${String(document.acknowledged)} of ${String(document.acknowledgmentTotal)} acknowledged`}
                  </Text>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-[rgba(11,19,32,0.14)] sm:mt-4"
                  role="progressbar"
                  aria-valuenow={ackPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Acknowledgment progress"
                >
                  <div
                    className="h-full rounded-full bg-[#566072] transition-[width] duration-300"
                    style={{ width: `${String(ackPercent)}%` }}
                  />
                </div>
                <div className="mt-7 flex justify-center">
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={onApprovals}
                    className="h-9 w-[183px] max-w-full rounded-[8px] border border-[rgba(11,19,32,0.14)] px-2 text-[14px] leading-5 font-normal text-[#0b1320] shadow-none hover:bg-white/80"
                  >
                    Approvals
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {isPreviewOpen ? (
        <VersionDocumentPreviewModal
          policyDocument={document}
          entry={previewEntry}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={() =>
            toast.success(
              "Download",
              `${previewEntry.version} download will be available soon.`,
            )
          }
        />
      ) : null}
    </div>
  );
}
