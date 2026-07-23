import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

/** Bump patch version: v3.1 → v3.2 */
export function nextDocumentVersion(version: string): string {
  const match = version.trim().match(/^v?(\d+)\.(\d+)$/i);
  if (!match) {
    return "vNext";
  }
  return `v${match[1]}.${String(Number(match[2]) + 1)}`;
}

/** Short PDF name matching Figma (e.g. LOTO_Procedure_v3.1.pdf). */
export function documentFileName(document: PolicyDocument): string {
  const slug = document.title
    .split(/[-–—]/)[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${slug}_${document.version}.pdf`;
}

export function mapDocumentKindToCategory(kind: string): string {
  const normalized = kind.trim().toLowerCase();
  if (normalized.includes("policy")) {
    return "policy";
  }
  if (normalized.includes("sop")) {
    return "sop";
  }
  if (normalized.includes("form")) {
    return "form";
  }
  if (normalized.includes("train")) {
    return "training";
  }
  if (normalized.includes("procedure")) {
    return "procedure";
  }
  return "procedure";
}
