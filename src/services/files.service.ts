import type { CreateUploadIntentRequestDto } from "@/dtos/req/files-request.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type {
  StoredFileResponseDto,
  UploadIntentResponseDto,
} from "@/dtos/res/files-response.dto";
import http, { HttpError } from "@/lib/axios";

const FILES_INTENT_PATH = "/files/upload-intent";
const FILES_BY_ID_PATH = "/files";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function unwrapEnvelope<T>(
  envelope: ApiEnvelopeDto<T> | undefined,
  fallback: string,
): T {
  if (!envelope || envelope.isError || envelope.success === false) {
    throw new HttpError({
      message: envelope?.message?.trim() || fallback,
      status: envelope?.statusCode,
      data: envelope,
    });
  }
  if (envelope.dataModel === undefined || envelope.dataModel === null) {
    throw new HttpError({
      message: envelope.message?.trim() || fallback,
      status: envelope.statusCode,
      data: envelope,
    });
  }
  return envelope.dataModel;
}

function mapIntent(raw: unknown): UploadIntentResponseDto {
  if (!isRecord(raw)) {
    throw new HttpError({ message: "Upload was not started." });
  }
  const fileId = asString(readProp(raw, "fileId", "FileId"));
  const uploadUrl = asString(readProp(raw, "uploadUrl", "UploadUrl"));
  if (!fileId || !uploadUrl) {
    throw new HttpError({ message: "Upload was not started." });
  }
  return {
    fileId,
    uploadUrl,
    thumbnailUploadUrl:
      asString(readProp(raw, "thumbnailUploadUrl", "ThumbnailUploadUrl")) ||
      null,
    expiresAtUtc: asString(readProp(raw, "expiresAtUtc", "ExpiresAtUtc")) ?? "",
  };
}

function mapStoredFile(raw: unknown): StoredFileResponseDto {
  if (!isRecord(raw)) {
    throw new HttpError({ message: "File not found", status: 404 });
  }
  const fileId = asString(readProp(raw, "fileId", "FileId"));
  const downloadUrl = asString(readProp(raw, "downloadUrl", "DownloadUrl"));
  if (!fileId || !downloadUrl) {
    throw new HttpError({ message: "File not found", status: 404 });
  }
  return {
    fileId,
    fileName: asString(readProp(raw, "fileName", "FileName")) ?? "file",
    mimeType: asString(readProp(raw, "mimeType", "MimeType")) ?? "",
    sizeBytes: asNumber(readProp(raw, "sizeBytes", "SizeBytes")) ?? 0,
    downloadUrl,
    previewUrl: asString(readProp(raw, "previewUrl", "PreviewUrl")) || null,
    thumbnailUrl:
      asString(readProp(raw, "thumbnailUrl", "ThumbnailUrl")) || null,
    createdDate: asString(readProp(raw, "createdDate", "CreatedDate")) ?? "",
  };
}

/** POST /files/upload-intent */
export async function createUploadIntent(
  payload: CreateUploadIntentRequestDto,
): Promise<UploadIntentResponseDto> {
  const { data } = await http.post<ApiEnvelopeDto<unknown>>(
    FILES_INTENT_PATH,
    payload,
  );
  return mapIntent(unwrapEnvelope(data, "Could not start the upload."));
}

/** PUT the raw file to the signed bucket URL. Do not attach a bearer token. */
export async function putFileToSignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) {
    throw new HttpError({
      message: "Upload was not completed",
      status: response.status,
    });
  }
}

/** POST /files/{fileId}/commit */
export async function commitFile(fileId: string): Promise<string> {
  const { data } = await http.post<ApiEnvelopeDto<unknown>>(
    `${FILES_BY_ID_PATH}/${fileId}/commit`,
  );
  const model = unwrapEnvelope(data, "Upload was not completed");
  if (isRecord(model)) {
    return asString(readProp(model, "fileId", "FileId")) ?? fileId;
  }
  return fileId;
}

/** GET /files/{fileId} — downloadUrl is valid for 15 minutes. Do not persist it. */
export async function getStoredFile(
  fileId: string,
): Promise<StoredFileResponseDto> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    `${FILES_BY_ID_PATH}/${fileId}`,
  );
  return mapStoredFile(unwrapEnvelope(data, "File not found"));
}
