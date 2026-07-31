export const CLOUDINARY_MAX_BYTES = 50 * 1024 * 1024;
export const CLOUDINARY_MAX_FILES = 10;

export const CLOUDINARY_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export type CloudinaryAllowedMimeType =
  (typeof CLOUDINARY_ALLOWED_MIME_TYPES)[number];

export function getCloudinaryCloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

export function getCloudinaryUploadPreset(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";
}

export function isCloudinaryPublicConfigReady(): boolean {
  return Boolean(getCloudinaryCloudName() && getCloudinaryUploadPreset());
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
): mimeType is CloudinaryAllowedMimeType {
  return (CLOUDINARY_ALLOWED_MIME_TYPES as readonly string[]).includes(
    mimeType,
  );
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}
