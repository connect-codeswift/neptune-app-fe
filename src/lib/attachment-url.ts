/** Query key used to remember the original upload filename on stored URLs. */
const DISPLAY_NAME_PARAM = "n";

/**
 * Attach the original file name to a delivery URL so GetById can restore it.
 * Cloudinary ignores unknown query params for asset delivery.
 */
export function withAttachmentDisplayName(
  url: string,
  fileName: string,
): string {
  const trimmedName = fileName.trim();
  if (!url.trim() || !trimmedName) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set(DISPLAY_NAME_PARAM, trimmedName);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function readAttachmentDisplayName(url: string): string | null {
  try {
    const value = new URL(url).searchParams.get(DISPLAY_NAME_PARAM)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

/** Delivery URL without the display-name query (for fetch / preview / HEAD). */
export function stripAttachmentDisplayName(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has(DISPLAY_NAME_PARAM)) {
      return url;
    }
    parsed.searchParams.delete(DISPLAY_NAME_PARAM);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function guessAttachmentKind(url: string): "image" | "video" | "pdf" {
  const lower = url.toLowerCase();
  const displayName = readAttachmentDisplayName(url)?.toLowerCase() ?? "";

  if (
    /\.(mp4|webm|mov)(\?|$)/.test(lower) ||
    lower.includes("/video/upload/")
  ) {
    return "video";
  }

  // Cloudinary PDFs are often `/raw/upload/...` without a `.pdf` suffix.
  if (
    /\.pdf(\?|$)/.test(lower) ||
    lower.includes("/raw/upload/") ||
    lower.includes("/raw/upload") ||
    displayName.endsWith(".pdf") ||
    displayName.includes(".pdf")
  ) {
    return "pdf";
  }

  return "image";
}

/** Prefer original upload name; fall back to a cleaned Cloudinary path segment. */
export function fileNameFromAttachmentUrl(
  url: string,
  index: number,
): string {
  const original = readAttachmentDisplayName(url);
  if (original) {
    return original;
  }

  try {
    const pathname = new URL(stripAttachmentDisplayName(url)).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    if (segment) {
      return decodeURIComponent(segment);
    }
  } catch {
    // ignore invalid URLs
  }

  return `Attachment ${String(index + 1)}`;
}

/**
 * Cloudinary delivery URLs embed a unix version: `/upload/v1716234567/...`.
 * That version is set at upload time and is our best persisted timestamp.
 */
export function uploadedAtFromAttachmentUrl(url: string): Date | null {
  try {
    const pathname = new URL(stripAttachmentDisplayName(url)).pathname;
    // Cloudinary version segment: `/upload/v1716234567/public_id`
    const match = /\/v(\d{9,13})\//.exec(pathname);
    const seconds = match?.[1] ? Number(match[1]) : NaN;
    if (!Number.isFinite(seconds)) {
      return null;
    }
    // Guard against non-timestamp version strings.
    if (seconds < 1_000_000_000 || seconds > 4_102_444_800) {
      return null;
    }
    return new Date(seconds * 1000);
  } catch {
    return null;
  }
}
