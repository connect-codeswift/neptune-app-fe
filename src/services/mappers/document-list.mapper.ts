import type {
  DocumentStatus,
  DocumentVersion,
  LibraryCategoryId,
  PolicyDocument,
} from "@/components/policy-maker/policy-maker-types";
import type {
  DocCategoryDto,
  DocDepartmentDto,
  DocumentDto,
  DocumentVersionDto,
} from "@/dtos/res/document-response.dto";

function formatDate(value: string | null | undefined): string {
  if (!value || value.trim() === "") {
    return "—";
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }
  return parsed.toISOString().slice(0, 10);
}

/**
 * Backend doesn't store an expiry date — it's derived as
 * (current version's updatedAt) + reviewCycle years.
 */
function computeExpiryDate(
  baseDate: string | null | undefined,
  reviewCycle: string | null | undefined,
): string | null {
  if (!baseDate?.trim()) {
    return null;
  }
  const years = Number(reviewCycle);
  if (!Number.isFinite(years) || years <= 0) {
    return null;
  }
  const parsed = new Date(baseDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const months = Math.round(years * 12);
  parsed.setMonth(parsed.getMonth() + months);
  return parsed.toISOString();
}

function versionBadge(
  entry: DocumentVersionDto,
): DocumentVersion["badge"] {
  if (entry.isCurrent) {
    return "current";
  }
  const status = (entry.status ?? "").trim().toLowerCase();
  if (status.includes("review") || status.includes("pending")) {
    return "review";
  }
  return "archived";
}

function buildVersions(
  versions: readonly DocumentVersionDto[] | null | undefined,
  fallback: Readonly<{
    version: string;
    ownerFullName: string;
    updated: string;
    filePath: string | null;
    fileName: string | null;
  }>,
): readonly DocumentVersion[] {
  if (versions && versions.length > 0) {
    return versions.map(mapVersionDto);
  }
  if (fallback.version === "—") {
    return [];
  }
  return [
    {
      version: fallback.version,
      author: shortenName(fallback.ownerFullName),
      date:
        fallback.updated === "—"
          ? "—"
          : fallback.updated.slice(5).replace("-", " "),
      badge: "current",
      filePath: fallback.filePath,
      fileName: fallback.fileName,
    },
  ];
}

function mapVersionDto(entry: DocumentVersionDto): DocumentVersion {
  const authorFullName = entry.updatedByName?.trim() || "—";
  const date = formatDate(entry.updatedAt);
  return {
    version: entry.versionLabel?.trim() || `v${String(entry.versionNo ?? 1)}`,
    author: shortenName(authorFullName),
    authorFullName,
    date,
    publishedAt: entry.updatedAt?.trim() || undefined,
    badge: versionBadge(entry),
    changeLog: entry.changeSummary?.trim() || undefined,
    filePath: entry.filePath?.trim() || undefined,
    fileName: entry.fileName?.trim() || undefined,
  };
}

function shortenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  if (parts.length === 1) {
    return parts[0] ?? "—";
  }
  const first = parts[0] ?? "";
  const lastInitial = (parts[parts.length - 1] ?? "").charAt(0);
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

function parseIdList(value: string | null | undefined): readonly string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function formatFileSize(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (value < 1024) {
    return `${String(value)} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function mapCategoryToLibraryId(
  raw: string | null | undefined,
): LibraryCategoryId {
  const normalized = (raw ?? "").trim().toLowerCase();
  if (normalized.includes("policy")) {
    return "policies";
  }
  if (
    normalized.includes("sop") ||
    normalized.includes("procedure") ||
    normalized.includes("standard operating")
  ) {
    return "sops";
  }
  if (normalized.includes("train")) {
    return "training";
  }
  if (normalized.includes("permit")) {
    return "permits";
  }
  if (normalized.includes("form")) {
    return "forms";
  }
  return "sops";
}

export function mapDocumentStatus(
  raw: string | null | undefined,
): DocumentStatus {
  const normalized = (raw ?? "").trim().toLowerCase();
  if (
    normalized.includes("review") ||
    normalized.includes("pending") ||
    normalized.includes("approval")
  ) {
    return "In review";
  }
  if (normalized.includes("expir")) {
    return "Expiring soon";
  }
  return "Current";
}

/** Display label for a category dropdown option (Upload/Edit forms). */
export function categoryOptionLabel(category: DocCategoryDto): string {
  return (
    category.categoryName?.trim() ||
    category.categorytName?.trim() ||
    category.name?.trim() ||
    `Category ${String(category.categoryId ?? category.id ?? "")}`
  );
}

/** Display label for a department dropdown option (Upload/Edit forms). */
export function departmentOptionLabel(department: DocDepartmentDto): string {
  return (
    department.departmentName?.trim() ||
    department.name?.trim() ||
    `Department ${String(department.departmentId ?? department.id ?? "")}`
  );
}

/**
 * Map of department id -> name, for resolving `departmentId` on document
 * detail responses that don't include a department name field at all.
 */
export function toDepartmentNameLookup(
  departments: readonly DocDepartmentDto[],
): ReadonlyMap<string, string> {
  const lookup = new Map<string, string>();
  for (const department of departments) {
    const name = department.departmentName?.trim() || department.name?.trim();
    if (!name) continue;

    for (const id of [department.departmentId, department.id]) {
      if (id != null) lookup.set(String(id), name);
    }
  }
  return lookup;
}

export function mapDocumentDtoToPolicyDocument(
  document: DocumentDto,
  options?: Readonly<{ departmentNameById?: ReadonlyMap<string, string> }>,
): PolicyDocument {
  const idValue = document.id != null ? String(document.id) : "0";
  const title = document.title?.trim() || "Untitled document";
  const ownerFullName =
    document.ownerName?.trim() ||
    document.createdByName?.trim() ||
    document.owner?.trim() ||
    "—";
  const currentVersionEntry =
    document.versions?.find((entry) => entry.isCurrent) ??
    document.versions?.[0] ??
    null;
  const version =
    currentVersionEntry?.versionLabel?.trim() ||
    document.version?.trim() ||
    document.currentVersion?.trim() ||
    "v1.0";
  const filePath =
    currentVersionEntry?.filePath?.trim() ||
    document.pdfPath?.trim() ||
    document.pdfUrl?.trim() ||
    document.fileUrl?.trim() ||
    null;
  const fileName =
    currentVersionEntry?.fileName?.trim() || document.fileName?.trim() || null;
  const categoryLabel =
    document.categoryName?.trim() ||
    document.category?.trim() ||
    document.documentKind?.trim() ||
    "SOP";
  const code =
    document.code?.trim() ||
    document.documentCode?.trim() ||
    `DOC-${idValue}`;
  const updated = formatDate(
    document.updatedAt ?? document.updated ?? document.createdAt,
  );
  const expiryBaseDate =
    currentVersionEntry?.updatedAt ??
    document.updatedAt ??
    document.updated ??
    document.createdAt;
  const expires = formatDate(
    document.expiresAt ??
      document.expiryDate ??
      document.expires ??
      computeExpiryDate(expiryBaseDate, document.reviewCycle),
  );
  const acknowledged = document.acknowledged ?? document.ackCount ?? 0;
  const acknowledgmentTotal =
    document.acknowledgmentTotal ?? document.totalAck ?? 0;
  const reviewersDone = document.reviewersDone ?? 0;
  const reviewersTotal = document.reviewersTotal ?? 0;

  return {
    id: idValue,
    category: mapCategoryToLibraryId(categoryLabel),
    title,
    code,
    site: document.site?.trim() || "—",
    version,
    owner: shortenName(ownerFullName),
    ownerFullName,
    status: mapDocumentStatus(document.status),
    expires,
    updated,
    reviewersDone,
    reviewersTotal,
    versions: buildVersions(document.versions, {
      version,
      ownerFullName,
      updated,
      filePath,
      fileName,
    }),
    filePath,
    fileName,
    fileType: document.fileType?.trim() || "PDF",
    fileSize: formatFileSize(document.fileSize),
    department:
      document.departmentName?.trim() ||
      document.department?.trim() ||
      (document.departmentId != null
        ? options?.departmentNameById?.get(String(document.departmentId))
        : undefined) ||
      "—",
    documentKind: document.documentKind?.trim() || categoryLabel,
    reviewDate: formatDate(document.reviewDate ?? document.createdAt),
    categoryId: document.categoryId ?? null,
    departmentId: document.departmentId ?? null,
    reviewCycle: document.reviewCycle?.trim() || "1",
    ackUserIds: parseIdList(document.ackUserIds),
    approverIds: parseIdList(document.approvalUserIds),
    acknowledged,
    acknowledgmentTotal,
    versionId: currentVersionEntry?.id ?? null,
  };
}

export function mapDocumentDtosToPolicyDocuments(
  documents: readonly DocumentDto[],
): PolicyDocument[] {
  return documents.map((document) => mapDocumentDtoToPolicyDocument(document));
}
