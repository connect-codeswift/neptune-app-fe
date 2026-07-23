export type LibraryCategoryId =
  | "policies"
  | "sops"
  | "training"
  | "permits"
  | "forms";

export type DocumentStatus = "Current" | "In review" | "Expiring soon";

export type DocumentStatusFilter = "All" | "Current" | "Review" | "Expiring";

export type DocumentVersion = Readonly<{
  version: string;
  author: string;
  date: string;
  badge: "review" | "archived" | "current";
  /** Changelog shown on Version History (Figma 5568:24918). */
  changeLog?: string;
  /** ISO date YYYY-MM-DD for Version History. */
  publishedAt?: string;
  authorFullName?: string;
}>;

export type PolicyDocument = Readonly<{
  id: string;
  category: LibraryCategoryId;
  title: string;
  code: string;
  site: string;
  version: string;
  owner: string;
  ownerFullName: string;
  status: DocumentStatus;
  expires: string;
  updated: string;
  reviewersDone: number;
  reviewersTotal: number;
  versions: readonly DocumentVersion[];
  /** Detail-page metadata (Figma 5568:24538). */
  fileType: string;
  fileSize: string;
  department: string;
  /** Singular kind shown under the title, e.g. "Procedure". */
  documentKind: string;
  reviewDate: string;
  acknowledged: number;
  acknowledgmentTotal: number;
}>;

export type LibraryCategory = Readonly<{
  id: LibraryCategoryId;
  label: string;
  icon: string;
  count: number;
}>;
