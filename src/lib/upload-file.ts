import type { FileModule } from "@/dtos/req/files-request.dto";
import {
  formatFileSize,
  isPdfMimeType,
  normaliseContentType,
  validateFileForModule,
} from "@/lib/files";
import {
  commitFile,
  createUploadIntent,
  putFileToSignedUrl,
} from "@/services/files.service";

export type FileUploadResult = Readonly<{
  fileId: string;
  /** Same as fileId — callers that used Cloudinary's public_id. */
  id: string;
  publicId: string;
  name: string;
  sizeLabel: string;
  bytes: number;
  mimeType: string;
  format: string;
  kind: "image" | "pdf";
  resourceType: "image" | "raw";
}>;

export type UploadFileOptions = Readonly<{
  module: FileModule;
  /** Defaults to true for PDFs. Thumbnails are best-effort. */
  withThumbnail?: boolean;
}>;

async function putObject(
  url: string,
  body: Blob,
  contentType: string,
): Promise<void> {
  await putFileToSignedUrl(url, body, contentType);
}

/**
 * Three-step private-bucket upload: intent → PUT bytes to R2 → commit.
 * Persist `fileId`. Do not persist any signed URL this helper might see.
 */
export async function uploadFile(
  file: File,
  options: UploadFileOptions,
): Promise<FileUploadResult> {
  const contentType = normaliseContentType(file.type);
  const validationError = validateFileForModule(file, options.module);
  if (validationError) {
    throw new Error(validationError);
  }

  const isPdf = isPdfMimeType(contentType);
  const wantThumbnail = options.withThumbnail ?? isPdf;
  let thumbnail: File | null = null;
  if (wantThumbnail && isPdf && typeof window !== "undefined") {
    const { renderPdfFirstPageJpeg } = await import("@/lib/pdf-thumbnail");
    thumbnail = await renderPdfFirstPageJpeg(file);
  }

  const intent = await createUploadIntent({
    fileName: file.name.trim() || "file",
    contentType,
    sizeBytes: file.size,
    module: options.module,
    withThumbnail: Boolean(thumbnail),
  });

  try {
    await putObject(intent.uploadUrl, file, contentType);
    if (thumbnail && intent.thumbnailUploadUrl) {
      await putObject(intent.thumbnailUploadUrl, thumbnail, "image/jpeg");
    }
  } catch (error) {
    // Rethrown as it arrived. The bucket's status is the whole diagnosis — 403
    // for a signature or a missing CORS rule, a TypeError for a blocked
    // preflight — and flattening all of it into one sentence left "images are
    // failing" as the most anyone reporting this could say.
    throw error instanceof Error
      ? error
      : new Error("Upload was not completed");
  }

  const fileId = await commitFile(intent.fileId);
  const displayName = file.name.trim() || "file";
  const format = isPdf
    ? "pdf"
    : ((contentType.split("/")[1] ?? "").split(";")[0] ?? "");

  return {
    fileId,
    id: fileId,
    publicId: fileId,
    name: displayName,
    sizeLabel: formatFileSize(file.size),
    bytes: file.size,
    mimeType: contentType,
    format,
    kind: isPdf ? "pdf" : "image",
    resourceType: isPdf ? "raw" : "image",
  };
}
