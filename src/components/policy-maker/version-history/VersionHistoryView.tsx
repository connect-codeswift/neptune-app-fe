"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { VersionDocumentPreviewModal } from "@/components/policy-maker/version-history/VersionDocumentPreviewModal";
import { VersionHistoryHeader } from "@/components/policy-maker/version-history/VersionHistoryHeader";
import { VersionHistoryList } from "@/components/policy-maker/version-history/VersionHistoryList";
import type { VersionHistoryCardModel } from "@/components/policy-maker/version-history/version-history-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

export type VersionHistoryViewProps = Readonly<{
  document: PolicyDocument;
}>;

/**
 * Version History screen (Figma 5568:24918).
 */
export function VersionHistoryView(props: Readonly<VersionHistoryViewProps>) {
  const { document } = props;
  const [previewEntry, setPreviewEntry] =
    useState<VersionHistoryCardModel | null>(null);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs…"
        searchonleft
        dateRangeLabel="March 25 — April 24, 2026"        onDateRangeClick={() =>
          toast.success("Date range", "Date filter coming soon.")
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-3.5 sm:px-4 sm:pb-8">
        <VersionHistoryHeader document={document} />
        <div className="w-full min-w-0 pt-0 sm:pt-0.5">
          <VersionHistoryList
            document={document}
            onViewVersion={setPreviewEntry}
          />
        </div>
      </div>

      {previewEntry ? (
        <VersionDocumentPreviewModal
          policyDocument={document}
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
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
