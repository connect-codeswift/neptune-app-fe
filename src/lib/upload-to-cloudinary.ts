import {
  formatFileSize,
  getCloudinaryCloudName,
  getCloudinaryUploadPreset,
  isCloudinaryPublicConfigReady,
  isPdfMimeType,
} from "@/lib/cloudinary-constants";

export type CloudinaryUploadResult = Readonly<{
  id: string;
  publicId: string;
  name: string;
  sizeLabel: string;
  bytes: number;
  url: string;
  secureUrl: string;
  resourceType: "image" | "raw" | "video" | "auto";
  format: string;
  mimeType: string;
  kind: "image" | "pdf";
}>;

type CloudinaryApiResponse = Readonly<{
  public_id?: string;
  secure_url?: string;
  url?: string;
  bytes?: number;
  format?: string;
  resource_type?: "image" | "raw" | "video" | "auto";
  original_filename?: string;
  error?: { message?: string };
}>;

export async function uploadFileToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryPublicConfigReady()) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();
  const isPdf = isPdfMimeType(file.type);

  // `auto` accepts images and PDFs via an unsigned upload preset.
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Unsigned presets reject `use_filename` / `unique_filename`.
  // `filename_override` is allowed and keeps the original name in metadata.
  const originalName = file.name.trim();
  if (originalName) {
    formData.append("filename_override", originalName);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as CloudinaryApiResponse;

  if (
    !response.ok ||
    payload.error ||
    !payload.public_id ||
    !payload.secure_url
  ) {
    throw new Error(
      payload.error?.message ?? "Cloudinary upload failed. Please try again.",
    );
  }

  const displayName = file.name.trim() || payload.original_filename || "file";

  const bytes = payload.bytes ?? file.size;
  const format = payload.format ?? (isPdf ? "pdf" : "");
  const kind: "image" | "pdf" =
    isPdf || format === "pdf" || payload.resource_type === "raw"
      ? "pdf"
      : "image";

  return {
    id: payload.public_id,
    publicId: payload.public_id,
    name: displayName,
    sizeLabel: formatFileSize(bytes),
    bytes,
    url: payload.url ?? payload.secure_url,
    secureUrl: payload.secure_url,
    resourceType: payload.resource_type ?? (kind === "pdf" ? "raw" : "image"),
    format,
    mimeType: file.type,
    kind,
  };
}
