export type IhDashboardTabId =
  | "overview"
  | "sampling-plans"
  | "agent-library"
  | "monitoring-records"
  | "medical-surveillance";

export type IhKpiItem = Readonly<{
  id: string;
  title: string;
  value: number;
  description: string;
  icon: string;
}>;

export type IhExceedanceItem = Readonly<{
  id: string;
  title: string;
  detail: string;
}>;

export type IhSamplingPlanStatus = "In Progress" | "Approved";

export type IhSamplingPlanItem = Readonly<{
  id: string;
  title: string;
  completed: number;
  total: number;
  status: IhSamplingPlanStatus;
}>;

export type IhAgentTypeItem = Readonly<{
  id: string;
  label: string;
  count: number;
  icon: string;
  active?: boolean;
}>;

export const IH_BASE_PATH = "/dashboard/industrial-hygiene";

export const IH_MODULE_TABS = [
  { id: "overview" as const, href: IH_BASE_PATH, label: "Overview" },
  {
    id: "sampling-plans" as const,
    href: `${IH_BASE_PATH}/sampling-plans`,
    label: "Sampling Plans",
  },
  {
    id: "agent-library" as const,
    href: `${IH_BASE_PATH}/agent-library`,
    label: "Agent Library",
  },
  {
    id: "monitoring-records" as const,
    href: `${IH_BASE_PATH}/monitoring-records`,
    label: "Monitoring Records",
  },
  {
    id: "medical-surveillance" as const,
    href: `${IH_BASE_PATH}/medical-surveillance`,
    label: "Medical Surveillance",
  },
] as const;

/** KPI tiles — Figma 5298:22257. */
export const IH_DASHBOARD_KPIS: readonly IhKpiItem[] = [
  {
    id: "active-plans",
    title: "Active sampling plans",
    value: 142,
    description: "Q2 cycle",
    icon: "mdi:flask-outline",
  },
  {
    id: "exceedances",
    title: "Exceedances (YTD)",
    value: 2,
    description: "Require CAPA",
    icon: "mdi:file-document-remove-outline",
  },
  {
    id: "pending-reviews",
    title: "Pending Reviews",
    value: 14,
    description: "Awaiting review",
    icon: "mdi:account-group-outline",
  },
  {
    id: "overdue",
    title: "Overdue Monitoring",
    value: 5,
    description: "Past due",
    icon: "mdi:clock-outline",
  },
];

/** Recent exceedances — Figma 5298:22288. */
export const IH_RECENT_EXCEEDANCES: readonly IhExceedanceItem[] = [
  {
    id: "exc-1",
    title: "Noise (A-weighted)",
    detail: "Tom Bradley · Maintenance Shop · 2026-05-10",
  },
  {
    id: "exc-2",
    title: "Silica Dust (RCS)",
    detail: "Group Sample · Grinding Station · 2026-04-28",
  },
  {
    id: "exc-3",
    title: "Benzene",
    detail: "Amy Chen · Lab 2 · 2026-05-05",
  },
];

/** Sampling plan progress — Figma 5298:22313. */
export const IH_SAMPLING_PLANS: readonly IhSamplingPlanItem[] = [
  {
    id: "plan-1",
    title: "Q2 Benzene & Dust Monitoring",
    completed: 5,
    total: 8,
    status: "In Progress",
  },
  {
    id: "plan-2",
    title: "Annual Noise Survey - Maintenance",
    completed: 3,
    total: 12,
    status: "Approved",
  },
  {
    id: "plan-3",
    title: "Lead & Heat - Battery Room",
    completed: 4,
    total: 6,
    status: "In Progress",
  },
];

/** Monitored agent type chips — Figma 5298:22347. */
export const IH_AGENT_TYPES: readonly IhAgentTypeItem[] = [
  {
    id: "chemical",
    label: "Chemical",
    count: 2,
    icon: "mdi:flask-outline",
    active: true,
  },
  {
    id: "noise",
    label: "Noise",
    count: 1,
    icon: "mdi:volume-high",
  },
  {
    id: "dust",
    label: "Dust",
    count: 2,
    icon: "mdi:weather-windy",
  },
  {
    id: "radiation",
    label: "Radiation",
    count: 1,
    icon: "mdi:pulse",
  },
  {
    id: "thermal",
    label: "Thermal",
    count: 1,
    icon: "mdi:thermometer",
  },
];

export function samplingPlanPercent(plan: IhSamplingPlanItem): number {
  if (plan.total <= 0) return 0;
  return Math.round((plan.completed / plan.total) * 1000) / 10;
}
