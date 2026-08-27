import type { FileModule } from "@/dtos/req/files-request.dto";
import { FILE_MODULES } from "@/dtos/req/files-request.dto";

export { FILE_MODULES, type FileModule };

const MB = 1024 * 1024;

/** Profile 5 MB, Document/HazCom 50 MB, everything else 25 MB. */
export const FILE_MAX_BYTES_BY_MODULE: Readonly<Record<FileModule, number>> = {
  Profile: 5 * MB,
  Document: 50 * MB,
  HazCom: 50 * MB,
  Incident: 25 * MB,
  NearMiss: 25 * MB,
  Hazard: 25 * MB,
  Audit: 25 * MB,
  Inspection: 25 * MB,
  Capa: 25 * MB,
  Bbs: 25 * MB,
  Ppe: 25 * MB,
};

export const FILE_MAX_FILES = 10;

export const FILE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
] as const;

export type FileAllowedMimeType = (typeof FILE_ALLOWED_MIME_TYPES)[number];

const STORED_FILE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFileModule(value: string): value is FileModule {
  return (FILE_MODULES as readonly string[]).includes(value);
}

export function getFileMaxBytes(module: FileModule): number {
  return FILE_MAX_BYTES_BY_MODULE[module];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAllowedMimeType(
  mimeType: string,
): mimeType is FileAllowedMimeType {
  if ((FILE_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return true;
  }
  return mimeType === "image/jpg";
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/** True when the stored value is a files-API id rather than a legacy public URL. */
export function isStoredFileId(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return STORED_FILE_ID_PATTERN.test(trimmed);
}

/** Existing Cloudinary (or other) public URLs still render until the backfill. */
export function isLegacyPublicUrl(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return /^https?:\/\//i.test(trimmed);
}

export function isBlobUrl(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith("blob:"));
}

/**
 * The content type an upload should travel under.
 *
 * Browsers on some Windows and Android setups report a .jpg as `image/jpg`,
 * which is not a registered type and is not on the backend's allowlist — the
 * upload intent was refused before a byte was sent. It is a JPEG either way, so
 * it goes up as one.
 *
 * Normalised in one place because the same string has to reach both the intent
 * and the PUT: the presigned url signs the content type, so the browser sending
 * anything else is a 403 from the bucket rather than a validation message.
 */
export function normaliseContentType(type: string): string {
  const trimmed = type.trim();
  if (!trimmed) {
    return "application/octet-stream";
  }
  return trimmed.toLowerCase() === "image/jpg" ? "image/jpeg" : trimmed;
}

export function validateFileForModule(
  file: File,
  module: FileModule,
): string | null {
  const contentType = normaliseContentType(file.type);
  if (!isAllowedMimeType(contentType)) {
    return `Files of type '${contentType}' are not allowed`;
  }

  const maxBytes = getFileMaxBytes(module);
  if (file.size <= 0) {
    return "File size is required";
  }
  if (file.size > maxBytes) {
    return `File exceeds the ${String(Math.round(maxBytes / MB))} MB limit`;
  }

  if (!file.name.trim()) {
    return "File name is required";
  }

  return null;
}
