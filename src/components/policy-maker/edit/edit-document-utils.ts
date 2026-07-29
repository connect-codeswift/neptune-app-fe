import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

function basenameFromPath(path: string): string | null {
  const segments = path.split(/[/\\]/).filter(Boolean);
  const last = segments[segments.length - 1];
  return last?.trim() || null;
}

/**
 * Label for the currently attached PDF. Uses the real stored file name from
 * the current version's `filePath` when available; falls back to a
 * title-derived guess for documents that predate that field.
 */
export function documentFileName(document: PolicyDocument): string {
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
