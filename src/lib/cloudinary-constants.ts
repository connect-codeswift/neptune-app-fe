import {
  FILE_ALLOWED_MIME_TYPES,
  FILE_MAX_BYTES_BY_MODULE,
  FILE_MAX_FILES,
  formatFileSize,
  isAllowedMimeType,
  isPdfMimeType,
  type FileAllowedMimeType,
} from "@/lib/files";

/** @deprecated Use FILE_MAX_BYTES_BY_MODULE / getFileMaxBytes. Kept for existing imports. */
export const CLOUDINARY_MAX_BYTES = FILE_MAX_BYTES_BY_MODULE.Document;
export const CLOUDINARY_MAX_FILES = FILE_MAX_FILES;
export const CLOUDINARY_ALLOWED_MIME_TYPES = FILE_ALLOWED_MIME_TYPES;

export type CloudinaryAllowedMimeType = FileAllowedMimeType;

export function getCloudinaryCloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

export function getCloudinaryUploadPreset(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";
}

export function isCloudinaryPublicConfigReady(): boolean {
  return Boolean(getCloudinaryCloudName() && getCloudinaryUploadPreset());
}

export { formatFileSize, isAllowedMimeType, isPdfMimeType };
