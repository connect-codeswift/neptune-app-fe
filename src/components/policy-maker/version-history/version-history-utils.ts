import type { DocumentVersion } from "@/components/policy-maker/policy-maker-types";

export type VersionHistoryStatus = "published" | "superseded" | "review";

export type VersionHistoryCardModel = Readonly<{
  version: string;
  status: VersionHistoryStatus;
  isCurrent: boolean;
  changeLog: string;
  publishedAt: string;
  authorFullName: string;
}>;

export function toVersionHistoryCard(
  entry: DocumentVersion,
): VersionHistoryCardModel {
  const isCurrent = entry.badge === "current";
  const status: VersionHistoryStatus =
    entry.badge === "review"
      ? "review"
      : entry.badge === "archived"
        ? "superseded"
        : "published";

  return {
    version: entry.version,
    status,
    isCurrent,
    changeLog:
      entry.changeLog ??
      `Document revision ${entry.version} published for controlled distribution.`,
    publishedAt: entry.publishedAt ?? entry.date,
    authorFullName: entry.authorFullName ?? entry.author,
  };
}
