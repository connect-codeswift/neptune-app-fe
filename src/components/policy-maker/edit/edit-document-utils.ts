import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

function basenameFromPath(path: string): string | null {
  const segments = path.split(/[/\\]/).filter(Boolean);
  const last = segments[segments.length - 1];
  return last?.trim() || null;
}

/**
 * Resolves a display filename from a fileName/filePath pair. Prefers the
 * real original filename; falls back to the storage path's basename (a
 * generated id, not the original name) for docs uploaded before that field
 * existed, and finally to a title-derived guess.
 */
export function resolveFileName(
  source: Readonly<{ fileName?: string | null; filePath?: string | null }>,
  fallbackTitle: string,
): string {
  if (source.fileName?.trim()) {
    return source.fileName.trim();
  }

  const fromPath = source.filePath ? basenameFromPath(source.filePath) : null;
  if (fromPath) {
    return fromPath;
  }

  const slug = fallbackTitle
    .split(/[-–—]/)[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${slug}.pdf`;
}

/** Label for the currently attached PDF (the document's current version). */
export function documentFileName(document: PolicyDocument): string {
  return resolveFileName(document, document.title);
}
