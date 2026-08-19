import type { ModuleFilterOption } from "@/components/ui/ModuleFilterBar";

/* The overdue chip's ink is pinned to #45556c, which sits between
   `--ehs-gray` (#566072) and `--ehs-slate` (#2a3446). */

/**
 * Backend CAPA list filters — GET /api/v1/capas
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

function capaStatusKey(status: string | null | undefined): string {
  return (status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

/** Closed / Complete CAPAs cannot be reopened or updated. */
export function isCapaStatusClosed(status: string | null | undefined): boolean {
  const key = capaStatusKey(status);
  return key === "closed" || key === "complete" || key === "dropped";
}

/** Verified (shown as Pending) — the reopen target. */
export function isCapaStatusPending(
  status: string | null | undefined,
): boolean {
  const key = capaStatusKey(status);
  return key === "verified" || key === "pending";
}

export function capaStatusPillClass(status: string): string {
  switch (status) {
    case "Open":
    case "In Progress":
      return "bg-ehs-normal-blue/12 text-ehs-normal-blue";
    case "Pending":
    case "Verified":
      return "bg-ehs-yellow/14 text-ehs-yellow";
    case "Overdue":
      return "bg-ehs-red/12 text-ehs-red";
    case "Complete":
    case "Closed":
      return "bg-ehs-surface-inverse/8 text-[#45556c]";
    default:
      return "bg-ehs-surface-inverse/6 text-ehs-gray";
  }
}
