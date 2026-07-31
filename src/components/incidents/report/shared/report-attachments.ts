export type ReportAttachmentKind = "image" | "pdf";

export type ReportPhotoFile = Readonly<{
  id: string;
  publicId?: string;
  name: string;
  sizeLabel: string;
  bytes?: number;
  url?: string;
  secureUrl?: string;
  mimeType?: string;
  format?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
  kind?: ReportAttachmentKind;
  /** Local object URL used while uploading / as optimistic preview */
  previewUrl?: string;
  isUploading?: boolean;
  error?: string;
}>;

export const DEFAULT_REPORT_PHOTOS: readonly ReportPhotoFile[] = [];
