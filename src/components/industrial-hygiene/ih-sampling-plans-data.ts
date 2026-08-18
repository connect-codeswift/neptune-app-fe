export type IhPlanListStatus = "In Progress" | "Approved" | "Draft";

export type IhPlanListItem = Readonly<{
  id: string;
  code: string;
  title: string;
  status: IhPlanListStatus;
  owner: string;
  nextDate: string;
  agents: string;
  completed: number;
  total: number;
}>;

/** Sampling Plans list — Figma 5305:30614. */
export const IH_PLAN_LIST: readonly IhPlanListItem[] = [
  {
    id: "plan-1",
    code: "SP-001",
    title: "Q2 Benzene & Dust Monitoring",
    status: "In Progress",
    owner: "Sarah Mitchell",
    nextDate: "2026-07-15",
    agents: "Benzene, Silica Dust (RCS)",
    completed: 5,
    total: 8,
  },
  {
    id: "plan-2",
    code: "SP-002",
    title: "Annual Noise Survey – Maintenance",
    status: "Approved",
    owner: "James Torres",
    nextDate: "2026-08-10",
    agents: "Noise (A-weighted)",
    completed: 3,
    total: 12,
  },
  {
    id: "plan-3",
    code: "SP-003",
    title: "Lead & Heat – Battery Room",
    status: "In Progress",
    owner: "Lena Park",
    nextDate: "2026-07-01",
    agents: "Lead, Heat Stress (WBGT)",
    completed: 4,
    total: 6,
  },
  {
    id: "plan-4",
    code: "SP-004",
    title: "Baseline Ergonomic Assessment",
    status: "Draft",
    owner: "Sarah Mitchell",
    nextDate: "2026-09-01",
    agents: "Ergonomic",
    completed: 0,
    total: 0,
  },
];

export function ihPlanPercent(plan: IhPlanListItem): number {
  if (plan.total <= 0) return 0;
  return Math.round((plan.completed / plan.total) * 100);
}
