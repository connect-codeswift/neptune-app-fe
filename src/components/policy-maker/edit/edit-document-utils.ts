import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

function basenameFromPath(path: string): string | null {
  const segments = path.split(/[/\\]/).filter(Boolean);
  const last = segments[segments.length - 1];
  return last?.trim() || null;
}

/**
 * Label for the currently attached PDF. Prefers the real original filename
 * (`fileName`); falls back to the storage path's basename (a generated id,
 * not the original name) for docs uploaded before that field existed, and
 * finally to a title-derived guess.
 */
export function documentFileName(document: PolicyDocument): string {
  if (document.fileName?.trim()) {
    return document.fileName.trim();
  }

  const fromPath = document.filePath
    ? basenameFromPath(document.filePath)
    : null;
  if (fromPath) {
    return fromPath;
  }

  const slug = document.title
    .split(/[-–—]/)[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${slug}.pdf`;
}
