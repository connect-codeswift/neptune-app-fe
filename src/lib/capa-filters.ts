import type { ModuleFilterOption } from "@/components/ui/ModuleFilterBar";

/**
 * Backend CAPA list filters — GET /api/CAPA
 * Query: Status, CapaType, Priority (omit / empty = All)
 */

export const CAPA_API_STATUS = {
  open: "Open",
  inProgress: "InProgress",
  overdue: "Overdue",
  verified: "Verified",
} as const;

/** Status chips shown in the toolbar (backend Status query values). */
export const CAPA_STATUS_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: CAPA_API_STATUS.open, label: "Open" },
  { value: CAPA_API_STATUS.inProgress, label: "In progress" },
  { value: CAPA_API_STATUS.overdue, label: "Overdue" },
  { value: CAPA_API_STATUS.verified, label: "Verified" },
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

/** Display labels used in register / detail badges (never invent "Planning"). */
export type CapaStatusDisplay =
  | "Open"
  | "In progress"
  | "Overdue"
  | "Verified"
  | "—";

/** Map a toolbar filter value to the API query string (empty = omit / All). */
export function toCapaListFilterParam(value: string): string {
  return value.trim();
}

/**
 * Format API `status` for UI. Does not invent Planning when status is missing.
 * Optional overdue-by-due-date only applies when the API did not send a terminal status.
 */
export function formatCapaStatusDisplay(
  rawStatus: string | null | undefined,
  options?: Readonly<{ overdueByDueDate?: boolean }>,
): CapaStatusDisplay {
  const raw = (rawStatus ?? "").trim();
  const key = raw.toLowerCase().replace(/[\s_-]+/g, "");

  if (
    key === "verified" ||
    key === "complete" ||
    key === "completed" ||
    key === "closed"
  ) {
    return "Verified";
  }
  if (key === "overdue") {
    return "Overdue";
  }
  if (
    key === "inprogress" ||
    key === "progress" ||
    key === "active" ||
    key === "inprocess"
  ) {
    return "In progress";
  }
  if (
    key === "open" ||
    key === "planning" ||
    key === "planned" ||
    key === "new"
  ) {
    return "Open";
  }

  if (options?.overdueByDueDate) {
    return "Overdue";
  }

  // No usable status from API — do not fabricate Planning.
  return "—";
}

export function capaStatusPillClass(status: string): string {
  switch (status) {
    case "Open":
      return "bg-[rgba(8,145,166,0.12)] text-[#0891a6]";
    case "In progress":
      return "bg-[rgba(59,130,246,0.12)] text-[#3b82f6]";
    case "Overdue":
      return "bg-[rgba(239,68,68,0.12)] text-[#ef4444]";
    case "Verified":
      return "bg-[rgba(16,185,129,0.12)] text-[#10b981]";
    default:
      return "bg-[rgba(15,23,42,0.06)] text-[#566072]";
  }
}
