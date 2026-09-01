export type UploadIntentResponseDto = Readonly<{
  fileId: string;
  uploadUrl: string;
  thumbnailUploadUrl: string | null;
  expiresAtUtc: string;
}>;

export type CommitFileResponseDto = Readonly<{
  fileId: string;
}>;

export type StoredFileResponseDto = Readonly<{
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  /** Renders in the browser rather than saving. Null for types with no viewer. */
  previewUrl: string | null;
  thumbnailUrl: string | null;
  createdDate: string;
}>;
