import type { MetricCardProps } from "@/components/ui/MetricCard";

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

export type CapaLifecycleStage =
  "Identified" | "Root cause" | "Action plan" | "Implement" | "Verify";

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
  progress: number;
  /** Backend status display label (Open / In progress / Overdue / Verified / Closed / —). */
  status: string;
  dueDate: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
  daysLeft: string;
  lifecycleStep: number;
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

export type CapaPendingReview = Readonly<{
  id: string;
  title: string;
  meta: string;
}>;

/** KPI tiles — Figma 7123:41940. */
export const CAPA_DASHBOARD_KPIS: readonly MetricCardProps[] = [
  {
    title: "Open CAPAs",
    value: "7",
    target: 8,
    targetLabel: "Target ≤ 8",
    isMorePositive: false,
    signalOwnedBy: "target",
    trend: [9, 8.5, 8.2, 8, 7.6, 7.2, 7],
  },
  {
    title: "Overdue",
    value: "1",
    target: 0,
    targetLabel: "Target 0",
    isMorePositive: false,
    signalOwnedBy: "target",
    trend: [0, 0, 0.2, 0.4, 0.5, 0.8, 1],
  },
  {
    title: "On-time Closure",
    value: "22",
    unit: "%",
    target: 90,
    targetLabel: "Target ≥ 90%",
    signalOwnedBy: "target",
    trend: [14, 15, 16, 18, 19, 20, 22],
  },
  {
    title: "Avg Days to Close",
    value: "12.4",
    unit: "d",
    target: 14,
    targetLabel: "Target ≤ 14d",
    isMorePositive: false,
    signalOwnedBy: "target",
    trend: [15.2, 14.8, 14.2, 13.6, 13.1, 12.8, 12.4],
  },
];

export const CAPA_LIFECYCLE_SLICES: readonly CapaLifecycleSlice[] = [
  { label: "Open", value: 1, color: "#0891a6" },
  { label: "In progress", value: 5, color: "#3b82f6" },
  { label: "Overdue", value: 1, color: "#ef4444" },
  { label: "Verified", value: 2, color: "#10b981" },
];

export const CAPA_OPENED_CLOSED_TREND: readonly CapaTrendPoint[] = [
  { week: "W19", opened: 5, closed: 3 },
  { week: "W20", opened: 4, closed: 4 },
  { week: "W21", opened: 6, closed: 3 },
  { week: "W22", opened: 3, closed: 5 },
  { week: "W23", opened: 5, closed: 4 },
  { week: "W24", opened: 4, closed: 5 },
  { week: "W25", opened: 6, closed: 4 },
  { week: "W26", opened: 4, closed: 5 },
];

export const CAPA_OWNER_WORKLOAD: readonly CapaOwnerWorkload[] = [
  { name: "S. Mitchell", openCount: 4 },
  { name: "M. Torres", openCount: 3 },
  { name: "A. Chen", openCount: 3 },
  { name: "D. Park", openCount: 2 },
  { name: "P. Mehra", openCount: 2 },
  { name: "J. Merrick", openCount: 1 },
];

export const CAPA_PENDING_REVIEWS: readonly CapaPendingReview[] = [
  {
    id: "CAPA-0419",
    title: "Update SOP & retrain on chemical splash response",
    meta: "CAPA-0419 · closed by S. Mitchell",
  },
];

const HOSE_TASKS: readonly CapaDashboardTask[] = [
  {
    id: "t1",
    label: "Conduct 5-Why analysis with operations",
    done: true,
  },
  {
    id: "t2",
    label: "Identify all affected presses (audit)",
    done: true,
  },
  {
    id: "t3",
    label: "Procure replacement hoses (PO #4421)",
    done: true,
  },
  {
    id: "t4",
    label: "Schedule planned downtime — Line 2",
    done: true,
  },
  {
    id: "t5",
    label: "Replace hoses on presses 1–8",
    done: false,
  },
  {
    id: "t6",
    label: "Update preventive maintenance schedule",
    done: false,
  },
];

/** Register rows — Figma table 7123:42324. */
export const CAPA_DASHBOARD_ITEMS: readonly CapaDashboardItem[] = [
  {
    id: "capa-0421",
    code: "CAPA-0421",
    type: "Corrective",
    title: "Replace all hydraulic hoses on 800-series presses",
    source: "From INC-2207 · Plant A",
    control: "Administrative Controls",
    owner: "M. Torres",
    progress: 62,
    status: "In progress",
    dueDate: "2026-05-08",
    dueLabel: "14d left",
    priority: "high",
    daysLeft: "14d",
    lifecycleStep: 3,
    tasks: HOSE_TASKS,
  },
  {
    id: "capa-0420",
    code: "CAPA-0420",
    type: "Preventive",
    title: "Add pedestrian-zone barriers in Warehouse 1 dock",
    source: "From INC-2206 · Warehouse 1",
    control: "Administrative Controls",
    owner: "A. Chen",
    progress: 35,
    status: "In progress",
    dueDate: "2026-05-15",
    dueLabel: "21d left",
    priority: "medium",
    daysLeft: "21d",
    lifecycleStep: 2,
    tasks: [],
  },
  {
    id: "capa-0419",
    code: "CAPA-0419",
    type: "Corrective",
    title: "Update SOP & retrain on chemical splash response",
    source: "From INC-2205 · Plant A",
    control: "Administrative Controls",
    owner: "S. Mitchell",
    progress: 80,
    status: "Overdue",
    dueDate: "2026-04-20",
    dueLabel: "Overdue",
    priority: "high",
    daysLeft: "0d",
    lifecycleStep: 3,
    tasks: [],
  },
  {
    id: "capa-0418",
    code: "CAPA-0418",
    type: "Preventive",
    title: "Install non-slip flooring near loading bay 3",
    source: "From INC-2204 · Warehouse 2",
    control: "Administrative Controls",
    owner: "R. Patel",
    progress: 18,
    status: "In progress",
    dueDate: "2026-05-15",
    dueLabel: "21d left",
    priority: "medium",
    daysLeft: "21d",
    lifecycleStep: 1,
    tasks: [],
  },
  {
    id: "capa-0417",
    code: "CAPA-0417",
    type: "Corrective",
    title: "Re-engineer guard interlock on Fab Line 1 grinder",
    source: "From INC-2203 · Plant B",
    control: "Administrative Controls",
    owner: "D. Park",
    progress: 48,
    status: "In progress",
    dueDate: "2026-05-15",
    dueLabel: "21d left",
    priority: "high",
    daysLeft: "21d",
    lifecycleStep: 2,
    tasks: [],
  },
  {
    id: "capa-0416",
    code: "CAPA-0416",
    type: "Preventive",
    title: "Pallet rack inspection program — quarterly",
    source: "From INC-2202 · All sites",
    control: "Administrative Controls",
    owner: "J. Merrick",
    progress: 8,
    status: "Open",
    dueDate: "2026-05-15",
    dueLabel: "21d left",
    priority: "low",
    daysLeft: "21d",
    lifecycleStep: 0,
    tasks: [],
  },
  {
    id: "capa-0415",
    code: "CAPA-0415",
    type: "Corrective",
    title: "Improve paint booth ventilation — Plant A",
    source: "From INC-2201 · Plant A",
    control: "Administrative Controls",
    owner: "A. Osei",
    progress: 100,
    status: "Verified",
    dueDate: "2026-04-10",
    dueLabel: "Closed",
    priority: "medium",
    daysLeft: "0d",
    lifecycleStep: 4,
    tasks: [],
  },
  {
    id: "capa-0414",
    code: "CAPA-0414",
    type: "Preventive",
    title: "Confined space permit audit — quarterly cadence",
    source: "From INC-2200 · Plant B",
    control: "Administrative Controls",
    owner: "P. Mehra",
    progress: 55,
    status: "In progress",
    dueDate: "2026-05-15",
    dueLabel: "21d left",
    priority: "medium",
    daysLeft: "21d",
    lifecycleStep: 2,
    tasks: [],
  },
  {
    id: "capa-0413",
    code: "CAPA-0413",
    type: "Preventive",
    title: "Ladder inspection tag program rollout",
    source: "From INC-2199 · All sites",
    control: "Administrative Controls",
    owner: "J. Bell",
    progress: 100,
    status: "Verified",
    dueDate: "2026-04-01",
    dueLabel: "Closed",
    priority: "low",
    daysLeft: "0d",
    lifecycleStep: 4,
    tasks: [],
  },
];

export const CAPA_LIFECYCLE_STAGES: readonly CapaLifecycleStage[] = [
  "Identified",
  "Root cause",
  "Action plan",
  "Implement",
  "Verify",
];

export function filterCapaDashboardItems(
  items: readonly CapaDashboardItem[],
  options: Readonly<{
    status: string;
    type: string;
    mineOnly: boolean;
    currentOwner?: string;
  }>,
): CapaDashboardItem[] {
  const { status, type, mineOnly, currentOwner = "M. Torres" } = options;

  return items.filter((item) => {
    const matchesStatus = status === "All" || item.status === status;
    const matchesType = type === "All" || item.type === type;
    const matchesMine = !mineOnly || item.owner === currentOwner;
    return matchesStatus && matchesType && matchesMine;
  });
}
