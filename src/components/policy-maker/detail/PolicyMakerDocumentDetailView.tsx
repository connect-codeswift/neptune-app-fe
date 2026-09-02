"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
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
import { formatDocumentDisplayId } from "@/services/mappers/document-list.mapper";

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
  "relative overflow-hidden rounded-4 border border-ehs-hairline/90 bg-ehs-surface/62 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:content-['']";

function DetailField(props: Readonly<{ label: string; children: ReactNode }>) {
  const { label, children } = props;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
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
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pt-4 pb-6 sm:gap-3.5 sm:px-4 sm:pb-8">
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
              <div className="relative z-1 flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="bg-ehs-surface-inverse/14 flex size-11 shrink-0 items-center justify-center rounded-2xl sm:size-12">
                    <Icon
                      icon="mdi:file-document-outline"
                      className="text-ehs-gray size-5 sm:size-6"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Text as="p" className="text4 text-ehs-darker truncate">
                      {document.title}
                    </Text>
                    <Text as="p" className="text8 text-ehs-gray truncate">
                      {documentFileName(document)}
                    </Text>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text4 rounded-2.5 before:rounded-2.5 bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-hover relative inline-flex h-9.5 w-fit max-w-full shrink-0 cursor-pointer items-center justify-center gap-2 px-4 whitespace-nowrap shadow-(--ehs-shadow-button-primary) transition-colors before:pointer-events-none before:absolute before:inset-0 before:content-['']"
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
              className={`${detailCardClass} flex min-w-0 flex-col gap-4 p-4 sm:px-[21px] sm:py-[21px]`}
            >
              <Text as="h2" className="text3 text-ehs-darker relative z-1">
                Document Details
              </Text>
              <div className="relative z-1 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                <DetailField label="ID">
                  <Text as="p" className="text4 text-ehs-darker">
                    {formatDocumentDisplayId(document.id)}
                  </Text>
                </DetailField>
                <DetailField label="Category">
                  <Text as="p" className="text4 text-ehs-darker">
                    {document.documentKind}
                  </Text>
                </DetailField>
                <DetailField label="Version">
                  <Text as="p" className="text4 text-ehs-darker">
                    {document.version}
                  </Text>
                </DetailField>
                <DetailField label="Status">
                  <span className="bg-ehs-surface-inverse/14 inline-flex h-[22px] items-center gap-1.25 rounded-full px-2.5">
                    <span
                      className="rounded-0.75 bg-ehs-gray size-1.5 shrink-0"
                      aria-hidden="true"
                    />
                    <Text as="span" className="text5 text-ehs-gray">
                      {displayStatus}
                    </Text>
                  </span>
                </DetailField>
                <DetailField label="Owner">
                  <Text as="p" className="text4 text-ehs-darker truncate">
                    {document.ownerFullName}
                  </Text>
                </DetailField>
                <DetailField label="Department">
                  <Text as="p" className="text4 text-ehs-darker">
                    {document.department}
                  </Text>
                </DetailField>
                <DetailField label="Review Date">
                  <Text as="p" className="text4 text-ehs-darker">
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
                <Text as="h2" className="text3 text-ehs-darker">
                  Acknowledgment Status
                </Text>
                <div className="flex flex-col items-stretch sm:mt-3">
                  <Text as="p" className="text2 text-ehs-darker text-center">
                    {`${String(ackPercent)}%`}
                  </Text>
                  <Text as="p" className="text8 text-ehs-gray text-center">
                    {`${String(document.acknowledged)} of ${String(document.acknowledgmentTotal)} acknowledged`}
                  </Text>
                </div>
                <div
                  className="bg-ehs-surface-inverse/14 h-2 w-full overflow-hidden rounded-full sm:mt-4"
                  role="progressbar"
                  aria-valuenow={ackPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Acknowledgment progress"
                >
                  <div
                    className="bg-ehs-gray h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${String(ackPercent)}%` }}
                  />
                </div>
                <div className="mt-7 flex justify-center">
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={onApprovals}
                    className="text4 text-ehs-darker rounded-2 border-ehs-border-ink/14 hover:bg-ehs-surface/80 h-9 w-45.75 max-w-full border px-2 shadow-none"
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
