import type { ModuleFilterOption } from "@/components/ui/ModuleFilterBar";

/**
 * Backend CAPA list filters — GET /api/CAPA
 * Query: Status, CapaType, Priority (omit / empty = All)
 */

export const CAPA_API_STATUS = {
  open: "Open",
  closed: "Closed",
} as const;

/** Status chips — values match GET /api/CAPA `status` / Status query. */
export const CAPA_STATUS_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: CAPA_API_STATUS.open, label: "Open" },
  { value: CAPA_API_STATUS.closed, label: "Closed" },
] as const;

export const CAPA_TYPE_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: "Corrective", label: "Corrective" },
  { value: "Preventive", label: "Preventive" },
] as const;

export const CAPA_PRIORITY_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
] as const;

/** Display labels used in register / detail badges (from API `status`). */
export type CapaStatusDisplay = string;

/** Map a toolbar filter value to the API query string (empty = omit / All). */
export function toCapaListFilterParam(value: string): string {
  return value.trim();
}

/**
 * Format API `status` for UI. Prefer the backend value; normalize common
 * Open / Closed spellings so pills and filters stay consistent.
 */
export function formatCapaStatusDisplay(
  rawStatus: string | null | undefined,
): CapaStatusDisplay {
  const raw = (rawStatus ?? "").trim();
  if (!raw) {
    return "—";
  }

  const key = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (key === "closed" || key === "dropped") {
    return "Closed";
  }
  if (key === "open") {
    return "Open";
  }

  return raw;
}

export function capaStatusPillClass(status: string): string {
  switch (status) {
    case "Open":
      return "bg-[rgba(8,145,166,0.12)] text-[#0891a6]";
    case "Closed":
      return "bg-[rgba(15,23,42,0.08)] text-[#45556c]";
    default:
      return "bg-[rgba(15,23,42,0.06)] text-[#566072]";
  }
}
