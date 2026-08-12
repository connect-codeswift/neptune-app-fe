"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PolicyMakerDocumentDetailHeader } from "@/components/policy-maker/detail/PolicyMakerDocumentDetailHeader";
import { documentFileName } from "@/components/policy-maker/edit/edit-document-utils";
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
  onEdit?: () => void;
  onVersionHistory?: () => void;
  onApproval?: () => void;
  onAcknowledgment?: () => void;
  onApprovals?: () => void;
  /** Only the assigned approver sees the Approval action. */
  canApprove?: boolean;
  /** Only the assigned ack-user sees the Acknowledgment action. */
  canAcknowledge?: boolean;
  isApproved?: boolean;
  isApproving?: boolean;
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
    onEdit,
    onVersionHistory,
    onApproval,
    onAcknowledgment,
    onApprovals,
    canApprove,
    canAcknowledge,
    isApproved,
    isApproving,
  } = props;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
      filePath: document.filePath,
      fileName: document.fileName,
    });
  }, [document]);
  const displayStatus = documentDisplayStatus(document.status);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-3.5 sm:px-4 sm:pb-8">
        <PolicyMakerDocumentDetailHeader
          document={document}
          onEdit={onEdit}
          onVersionHistory={onVersionHistory}
          onApproval={onApproval}
          onAcknowledgment={onAcknowledgment}
          canApprove={canApprove}
          canAcknowledge={canAcknowledge}
          isApproved={isApproved}
          isApproving={isApproving}
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
                      className="sm:text-3.5 truncate text-[13px] leading-5 text-[#566072]"
                    >
                      {documentFileName(document)}
                    </Text>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-3.5 relative inline-flex h-[38px] w-fit max-w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0891a6] px-4 leading-5 font-medium whitespace-nowrap text-white shadow-[0px_5.838px_17.514px_-5.838px_#0891a6] transition-colors before:pointer-events-none before:absolute before:inset-0 before:rounded-[9.73px] before:shadow-[inset_0px_0.973px_0px_0.973px_rgba(255,255,255,0.25)] before:content-[''] hover:bg-[#078196]"
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
                  <Text as="p" className="text-3.5 leading-5 text-[#0b1320]">
                    {document.documentKind}
                  </Text>
                </DetailField>
                <DetailField label="Version">
                  <Text as="p" className="text-3.5 leading-5 text-[#0b1320]">
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
                    className="text-3.5 truncate leading-5 text-[#0b1320]"
                  >
                    {document.ownerFullName}
                  </Text>
                </DetailField>
                <DetailField label="Department">
                  <Text as="p" className="text-3.5 leading-5 text-[#0b1320]">
                    {document.department}
                  </Text>
                </DetailField>
                <DetailField label="Review Date">
                  <Text as="p" className="text-3.5 leading-5 text-[#0b1320]">
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
                    className="text-3.5 h-9 w-[183px] max-w-full rounded-[8px] border border-[rgba(11,19,32,0.14)] px-2 leading-5 font-normal text-[#0b1320] shadow-none hover:bg-white/80"
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
