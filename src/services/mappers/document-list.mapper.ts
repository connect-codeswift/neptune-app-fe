import type {
  DocumentStatus,
  LibraryCategoryId,
  PolicyDocument,
} from "@/components/policy-maker/policy-maker-types";
import type { DocumentDto } from "@/dtos/res/document-response.dto";

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

export function mapDocumentDtoToPolicyDocument(
  document: DocumentDto,
): PolicyDocument {
  const idValue = document.id != null ? String(document.id) : "0";
  const title = document.title?.trim() || "Untitled document";
  const ownerFullName =
    document.ownerName?.trim() ||
    document.createdByName?.trim() ||
    document.owner?.trim() ||
    "—";
  const version =
    document.version?.trim() ||
    document.currentVersion?.trim() ||
    "v1.0";
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
  const expires = formatDate(
    document.expiresAt ?? document.expiryDate ?? document.expires,
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
    versions:
      version !== "—"
        ? [
            {
              version,
              author: shortenName(ownerFullName),
              date: updated === "—" ? "—" : updated.slice(5).replace("-", " "),
              badge: "current",
            },
          ]
        : [],
    fileType: document.fileType?.trim() || "PDF",
    fileSize: formatFileSize(document.fileSize),
    department:
      document.departmentName?.trim() ||
      document.department?.trim() ||
      "—",
    documentKind: document.documentKind?.trim() || categoryLabel,
    reviewDate: formatDate(document.reviewDate ?? document.createdAt),
    acknowledged,
    acknowledgmentTotal,
  };
}

export function mapDocumentDtosToPolicyDocuments(
  documents: readonly DocumentDto[],
): PolicyDocument[] {
  return documents.map(mapDocumentDtoToPolicyDocument);
}
