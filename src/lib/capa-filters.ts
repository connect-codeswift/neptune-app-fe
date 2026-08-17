import type { ModuleFilterOption } from "@/components/ui/ModuleFilterBar";

/**
 * Backend CAPA list filters — GET /api/CAPA
 * Query: Scope?, Status?, CapaType?, Priority?, Search?, PageNumber, PageSize
 * Empty string = All = omit the param.
 */

export const CAPA_API_SCOPE = {
  assignedToMe: "AssignedToMe",
} as const;

/** Stored status values the API accepts. Do not send Pending or Complete. */
export const CAPA_API_STATUS = {
  open: "Open",
  inProgress: "In Progress",
  verified: "Verified",
  closed: "Closed",
  overdue: "Overdue",
} as const;

export const CAPA_SCOPE_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: CAPA_API_SCOPE.assignedToMe, label: "Assigned to me" },
] as const;

/**
 * Chip label vs stored value. Verified = Pending review, Closed = Complete.
 * Sending the label (`Pending` / `Complete`) returns 400.
 */
export const CAPA_STATUS_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: CAPA_API_STATUS.open, label: "Open" },
  { value: CAPA_API_STATUS.inProgress, label: "In Progress" },
  { value: CAPA_API_STATUS.verified, label: "Pending" },
  { value: CAPA_API_STATUS.closed, label: "Complete" },
  { value: CAPA_API_STATUS.overdue, label: "Overdue" },
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
 * Friendly labels for stored status. Filter chips and table badges share this
 * so Verified never reads as "already verified".
 */
export function formatCapaStatusDisplay(
  rawStatus: string | null | undefined,
): CapaStatusDisplay {
  const raw = (rawStatus ?? "").trim();
  if (!raw) {
    return "—";
  }

  const key = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (key === "verified") {
    return "Pending";
  }
  if (key === "closed" || key === "dropped") {
    return "Complete";
  }
  if (key === "inprogress") {
    return "In Progress";
  }
  if (key === "open") {
    return "Open";
  }
  if (key === "overdue") {
    return "Overdue";
  }

  return raw;
}

export function capaStatusPillClass(status: string): string {
  switch (status) {
    case "Open":
    case "In Progress":
      return "bg-[rgba(8,145,166,0.12)] text-[#0891a6]";
    case "Pending":
    case "Verified":
      return "bg-[rgba(245,158,11,0.14)] text-[#f59e0b]";
    case "Overdue":
      return "bg-[rgba(239,68,68,0.12)] text-[#ef4444]";
    case "Complete":
    case "Closed":
      return "bg-[rgba(15,23,42,0.08)] text-[#45556c]";
    default:
      return "bg-[rgba(15,23,42,0.06)] text-[#566072]";
  }
}
