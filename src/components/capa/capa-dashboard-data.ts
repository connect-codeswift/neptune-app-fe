
/** Figma CAPA Dashboard status filter — node 7123:41912.
 * Prefer `CAPA_STATUS_FILTER_OPTIONS` in `@/lib/capa-filters` for live API filters.
 */
export const CAPA_DASHBOARD_STATUS_FILTERS = ["All", "Open", "Closed"] as const;

export const CAPA_DASHBOARD_TYPE_FILTERS = [
  "All",
  "Corrective",
  "Preventive",
] as const;

export type CapaDashboardStatus =
  (typeof CAPA_DASHBOARD_STATUS_FILTERS)[number];
export type CapaDashboardType = (typeof CAPA_DASHBOARD_TYPE_FILTERS)[number];

export type CapaDashboardTask = Readonly<{
  id: string;
  label: string;
  done: boolean;
}>;

export type CapaDashboardItem = Readonly<{
  id: string;
  code: string;
  type: "Corrective" | "Preventive";
  title: string;
  source: string;
  /** Hierarchy of controls level (e.g. Administrative Controls). */
  control: string;
  owner: string;
  /** Who raised the CAPA, as opposed to who owns it. */
  assignedBy: string;
  progress: number;
  /** Stored status, spelled as the API spells it — see `CAPA_API_STATUS`. */
  status: string;
  dueDate: string;
  dueLabel: string;
  /**
   * Past due and not Closed, decided by the API rather than re-derived here - the register
   * filters on the same flag, so a locally computed one could disagree with the chip.
   */
  isOverdue: boolean;
  priority: "high" | "medium" | "low";
  daysLeft: string;
  tasks: readonly CapaDashboardTask[];
}>;

export type CapaLifecycleSlice = Readonly<{
  label: string;
  value: number;
  color: string;
}>;

export type CapaTrendPoint = Readonly<{
  week: string;
  opened: number;
  closed: number;
}>;

export type CapaOwnerWorkload = Readonly<{
  name: string;
  openCount: number;
}>;

/**
 * One row in the "Awaiting Effectiveness Review" queue — a CAPA in `Completed`
 * or `Pending Verification`. Both statuses open the same verification form;
 * only Ehs_Director / Ehs_Lead / Ehs_Manager may sign one off, and never on a
 * CAPA assigned to themselves.
 */
export type CapaAwaitingReviewRow = Readonly<{
  capaId: number;
  code: string;
  title: string;
  owner: string;
  assignedId: number | null;
  /** Stored status, spelled as the API spells it — see `CAPA_API_STATUS`. */
  status: string;
  dueLabel: string;
}>;
