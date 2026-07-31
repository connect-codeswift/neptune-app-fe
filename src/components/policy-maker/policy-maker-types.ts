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
  /** This version's own PDF URL — distinct from PolicyDocument.filePath (current version only). */
  filePath?: string | null;
  /** This version's own original filename. */
  fileName?: string | null;
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
  /** Raw ids kept alongside the display strings above, for prefilling Edit. */
  categoryId?: number | null;
  departmentId?: number | null;
  reviewCycle?: string;
  ackUserIds?: readonly string[];
  approverIds?: readonly string[];
  /** Server path/URL of the current version's PDF, for the Edit file card. */
  filePath?: string | null;
  /** Original uploaded filename, when the backend has it (older docs may be null). */
  fileName?: string | null;
  /** Numeric id of the current version row, needed for PUT /api/Document/Acknowledgement. */
  versionId?: number | null;
}>;

export type LibraryCategory = Readonly<{
  id: LibraryCategoryId;
  label: string;
  icon: string;
  count: number;
}>;
