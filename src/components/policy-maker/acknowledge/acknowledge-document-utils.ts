import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

/** Format like Figma: "22 apr 2025". */
export function formatPublishedLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  const day = date.getDate();
  const month = date
    .toLocaleString("en-US", { month: "short" })
    .toLowerCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function versionLabel(version: string): string {
  const trimmed = version.trim();
  if (/^v/i.test(trimmed)) {
    return `Version ${trimmed.slice(1)}`;
  }
  return `Version ${trimmed}`;
}
