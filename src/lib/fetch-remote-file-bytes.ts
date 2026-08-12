import { stripAttachmentDisplayName } from "@/lib/attachment-url";

export type RemoteFileMeta = Readonly<{
  bytes: number | null;
  lastModified: Date | null;
}>;

/**
 * Best-effort remote byte size + Last-Modified for a public file URL (e.g. Cloudinary).
 * Uses HEAD, then a Range GET fallback for size.
 */
export async function fetchRemoteFileMeta(
  url: string,
): Promise<RemoteFileMeta> {
  const trimmed = stripAttachmentDisplayName(url.trim());
  if (!trimmed) {
    return { bytes: null, lastModified: null };
  }

  let bytes: number | null = null;
  let lastModified: Date | null = null;

  try {
    const head = await fetch(trimmed, { method: "HEAD", mode: "cors" });
    if (head.ok) {
      bytes = parsePositiveInt(head.headers.get("content-length"));
      lastModified = parseHttpDate(head.headers.get("last-modified"));
      if (bytes != null) {
        return { bytes, lastModified };
      }
    }
  } catch {
    // CORS or network — try Range GET below.
  }

  try {
    const range = await fetch(trimmed, {
      method: "GET",
      mode: "cors",
      headers: { Range: "bytes=0-0" },
    });

    bytes =
      parseContentRangeTotal(range.headers.get("content-range")) ??
      parsePositiveInt(range.headers.get("content-length"));
    lastModified =
      lastModified ?? parseHttpDate(range.headers.get("last-modified"));
  } catch {
    // ignore
  }

  return { bytes, lastModified };
}

function parsePositiveInt(value: string | null): number | null {
  if (!value?.trim()) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.trunc(parsed);
}

/** Parses `bytes 0-0/12345` → `12345`. */
function parseContentRangeTotal(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const match = /\/(\d+)\s*$/.exec(value);
  if (!match?.[1]) {
    return null;
  }
  return parsePositiveInt(match[1]);
}

function parseHttpDate(value: string | null): Date | null {
  if (!value?.trim()) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
