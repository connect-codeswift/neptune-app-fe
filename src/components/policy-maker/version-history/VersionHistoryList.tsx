"use client";

import { VersionHistoryCard } from "@/components/policy-maker/version-history/VersionHistoryCard";
import {
  toVersionHistoryCard,
  type VersionHistoryCardModel,
} from "@/components/policy-maker/version-history/version-history-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

export type VersionHistoryListProps = Readonly<{
  document: PolicyDocument;
  onViewVersion?: (entry: VersionHistoryCardModel) => void;
  className?: string;
}>;

/**
 * Stacked version cards (Figma 5568:24957).
 */
export function VersionHistoryList(props: Readonly<VersionHistoryListProps>) {
  const { document, onViewVersion, className = "" } = props;
  const entries = document.versions.map(toVersionHistoryCard);

  return (
    <div
      className={["flex w-full min-w-0 flex-col gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      {entries.map((entry) => (
        <VersionHistoryCard
          key={`${entry.version}-${entry.publishedAt}`}
          entry={entry}
          onDownload={() =>
            toast.success(
              "Download",
              `${entry.version} download will be available soon.`,
            )
          }
          onView={() => onViewVersion?.(entry)}
        />
      ))}
    </div>
  );
}
