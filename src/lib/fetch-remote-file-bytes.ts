import { stripAttachmentDisplayName } from "@/lib/attachment-url";

/**
 * Best-effort remote byte size for a public file URL (e.g. Cloudinary).
 * Uses HEAD `Content-Length`, then a Range GET `Content-Range` fallback.
 */
export async function fetchRemoteFileBytes(
  url: string,
): Promise<number | null> {
  const trimmed = stripAttachmentDisplayName(url.trim());
  if (!trimmed) {
    return null;
  }

  try {
    const head = await fetch(trimmed, { method: "HEAD", mode: "cors" });
    if (head.ok) {
      const fromLength = parsePositiveInt(head.headers.get("content-length"));
      if (fromLength != null) {
        return fromLength;
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

    const fromRange = parseContentRangeTotal(
      range.headers.get("content-range"),
    );
    if (fromRange != null) {
      return fromRange;
    }

    return parsePositiveInt(range.headers.get("content-length"));
  } catch {
    return null;
  }
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
