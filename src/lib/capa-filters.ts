import type { ModuleFilterOption } from "@/components/ui/ModuleFilterBar";

/* The overdue chip's ink is pinned to #45556c, which sits between
   `--ehs-gray` (#566072) and `--ehs-slate` (#2a3446). */

/**
 * Backend CAPA list filters — GET /api/v1/capas
 * Query: Status?, CapaType?, Priority?, Search?, PageNumber, PageSize
 * Empty string = All = omit the param.
 */

/**
 * The stored status values, exactly as the API spells them. OpenAPI pins the
 * `Status` query param to `^(All|Open|In Progress|Completed|Pending Verification|Closed|Overdue)$`
 * — anything else is a 400, so these strings are sent verbatim and never
 * re-labelled for display.
 *
 * `Overdue` is not a stored status: it means past `dueDate` and not `Closed`.
 * The API accepts it as a filter and derives it per row via `isOverdue`.
 */
export const CAPA_API_STATUS = {
  all: "All",
  open: "Open",
  inProgress: "In Progress",
  completed: "Completed",
  pendingVerification: "Pending Verification",
  closed: "Closed",
  overdue: "Overdue",
} as const;

/**
 * The five stored stages in lifecycle order. Used as the stepper fallback when
 * a CAPA detail response carries no `lifecycleStages`.
 */
export const CAPA_LIFECYCLE_STAGES = [
  CAPA_API_STATUS.open,
  CAPA_API_STATUS.inProgress,
  CAPA_API_STATUS.completed,
  CAPA_API_STATUS.pendingVerification,
  CAPA_API_STATUS.closed,
] as const;

/** Chip value and label are the same string — the API owns both. */
export const CAPA_STATUS_FILTER_OPTIONS: readonly ModuleFilterOption[] = [
  { value: "", label: "All" },
  { value: CAPA_API_STATUS.open, label: "Open" },
  { value: CAPA_API_STATUS.inProgress, label: "In Progress" },
  { value: CAPA_API_STATUS.completed, label: "Completed" },
  {
    value: CAPA_API_STATUS.pendingVerification,
    label: "Pending Verification",
  },
  { value: CAPA_API_STATUS.closed, label: "Closed" },
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

function capaStatusKey(status: string | null | undefined): string {
  return (status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

/**
 * Canonicalize whatever the API sent into its exact stored spelling. This is a
 * spelling fix, not a rename: the badge shows the same word the API filters on,
 * so a chip and a row can never disagree.
 *
 * `verified` is the pre-rename value for what is now `Pending Verification`,
 * accepted so a stale cached row still renders as something real.
 */
export function formatCapaStatusDisplay(
  rawStatus: string | null | undefined,
): CapaStatusDisplay {
  const raw = (rawStatus ?? "").trim();
  if (!raw) {
    return "—";
  }

  switch (capaStatusKey(raw)) {
    case "open":
      return CAPA_API_STATUS.open;
    case "inprogress":
      return CAPA_API_STATUS.inProgress;
    case "completed":
    case "complete":
      return CAPA_API_STATUS.completed;
    case "pendingverification":
    case "pending":
    case "verified":
      return CAPA_API_STATUS.pendingVerification;
    case "closed":
      return CAPA_API_STATUS.closed;
    case "overdue":
      return CAPA_API_STATUS.overdue;
    default:
      return raw;
  }
}

/** Closed (or dropped) CAPAs cannot be reopened or updated. */
export function isCapaStatusClosed(status: string | null | undefined): boolean {
  const key = capaStatusKey(status);
  return key === "closed" || key === "dropped";
}

/** All tasks are done and the CAPA is waiting to be sent for verification. */
export function isCapaStatusCompleted(
  status: string | null | undefined,
): boolean {
  const key = capaStatusKey(status);
  return key === "completed" || key === "complete";
}

/** Sent for verification, waiting on a verifier. */
export function isCapaStatusPendingVerification(
  status: string | null | undefined,
): boolean {
  const key = capaStatusKey(status);
  return (
    key === "pendingverification" || key === "pending" || key === "verified"
  );
}

export function capaStatusPillClass(status: string): string {
  switch (formatCapaStatusDisplay(status)) {
    case CAPA_API_STATUS.open:
    case CAPA_API_STATUS.inProgress:
      return "bg-ehs-normal-blue/12 text-ehs-normal-blue";
    case CAPA_API_STATUS.completed:
      return "bg-ehs-green/14 text-ehs-green";
    case CAPA_API_STATUS.pendingVerification:
      return "bg-ehs-yellow/14 text-ehs-yellow";
    case CAPA_API_STATUS.overdue:
      return "bg-ehs-red/12 text-ehs-red";
    case CAPA_API_STATUS.closed:
      return "bg-ehs-surface-inverse/8 text-[#45556c]";
    default:
      return "bg-ehs-surface-inverse/6 text-ehs-gray";
  }
}
