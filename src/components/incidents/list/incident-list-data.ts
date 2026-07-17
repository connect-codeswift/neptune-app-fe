import type { KpiMetricCardProps } from "@/components/KpiMetricCard";

export type IncidentSeverity =
  | "Lost Time"
  | "Near Miss"
  | "First Aid"
  | "Recordable"
  | "SIA"
  | "SIP";

export type IncidentStage =
  | "Open"
  | "New"
  | "Investigating"
  | "Corrective"
  | "Closed";

export type IncidentState = "Open" | "Closed";

export type IncidentCapa = Readonly<{
  id: string;
  hierarchy: string;
  status: string;
  priority: string;
  description: string;
  assignee: string;
  dueDate: string;
  type: string;
}>;

export type IncidentTimelineItem = Readonly<{
  id: string;
  icon: string;
  title: string;
  time: string;
}>;

export type IncidentRecord = Readonly<{
  id: string;
  title: string;
  description: string;
  site: string;
  severity: IncidentSeverity;
  stage: IncidentStage;
  state: IncidentState;
  reportedAt: string;
  reporter: string;
  assignee: string;
  injury: string;
  summary: string;
  capas: readonly IncidentCapa[];
  timeline: readonly IncidentTimelineItem[];
}>;

export const LIST_KPI_METRICS: readonly KpiMetricCardProps[] = [
  {
    title: "Open Incidents",
    value: "6",
    unit: "",
    trendValue: "-2",
    trendDirection: "down",
    targetLabel: "Target ≤ 10",
    chartData: [10, 9, 8, 7, 7, 6, 6],
  },
  {
    title: "Mean Time to Close",
    value: "4.2",
    unit: "d",
    trendValue: "-0.6",
    trendDirection: "down",
    targetLabel: "Target ≤ 5d",
    chartData: [5.4, 5.1, 4.9, 4.7, 4.5, 4.3, 4.2],
  },
  {
    title: "Recordable Rate",
    value: "2.3",
    unit: "RIR",
    trendValue: "-0.4",
    trendDirection: "down",
    targetLabel: "Target ≤ 2.5",
    chartData: [3.1, 2.9, 2.8, 2.6, 2.5, 2.4, 2.3],
  },
  {
    title: "Days Without LTI",
    value: "47",
    unit: "days",
    trendValue: "+1",
    trendDirection: "up",
    targetLabel: "Target best 112",
    chartData: [40, 41, 42, 43, 45, 46, 47],
  },
];

export const STATE_FILTERS = ["All", "Open", "Closed"] as const;
export const STAGE_FILTERS = [
  "All",
  "New",
  "Investigating",
  "Corrective",
  "Closed",
] as const;
export const SEVERITY_FILTERS = [
  "All",
  "First Aid",
  "Recordable",
  "Lost Time",
  "SIA",
  "SIP",
] as const;

const SHARED_TIMELINE: readonly IncidentTimelineItem[] = [
  {
    id: "t1",
    icon: "mdi:alert-outline",
    title: "Maria Lopez · Incident reported via mobile",
    time: "09:12",
  },
  {
    id: "t2",
    icon: "mdi:cog-outline",
    title: "System · Auto-routed to S. Mitchell (EHS)",
    time: "09:18",
  },
  {
    id: "t3",
    icon: "mdi:check-circle-outline",
    title: "Sarah Mitchell · Acknowledged · investigation opened",
    time: "09:34",
  },
  {
    id: "t4",
    icon: "mdi:clipboard-text-outline",
    title: "Sarah Mitchell · Site cordoned · maintenance dispatched",
    time: "10:02",
  },
  {
    id: "t5",
    icon: "mdi:wrench-outline",
    title: "Maintenance · Replacement hose ordered (ETA 2h)",
    time: "10:41",
  },
];

const SHARED_CAPA: IncidentCapa = {
  id: "CAPA-0421",
  hierarchy: "Substitution",
  status: "In progress",
  priority: "high",
  description:
    "Replace all 800-series press hoses with low-pressure hydraulic spec",
  assignee: "M. Torres",
  dueDate: "2026-05-08",
  type: "Corrective",
};

export const INCIDENT_RECORDS: readonly IncidentRecord[] = [
  {
    id: "INC-2207",
    title: "Hydraulic press hose rupture",
    description: "Equipment failure reported by Maria Lopez",
    site: "Plant A · Line 2",
    severity: "Lost Time",
    stage: "Open",
    state: "Open",
    reportedAt: "2026-04-24 09:12",
    reporter: "Maria Lopez",
    assignee: "Sarah Mitchell",
    injury: "Lost time",
    summary:
      "During second-shift operation, the high-pressure hose on press #4 ruptured at the coupling. Fluid contained within the guarding; no operator contact. Press isolated under LOTO pending hose replacement.",
    capas: [SHARED_CAPA],
    timeline: SHARED_TIMELINE,
  },
  {
    id: "INC-2198",
    title: "Forklift near-miss — loading bay",
    description: "Near miss reported by James Chen",
    site: "Warehouse 1",
    severity: "Near Miss",
    stage: "New",
    state: "Open",
    reportedAt: "2026-04-23 14:40",
    reporter: "James Chen",
    assignee: "Sarah Mitchell",
    injury: "None",
    summary:
      "Forklift narrowly avoided collision with a pedestrian in the loading bay. Area temporarily restricted pending traffic control review.",
    capas: [],
    timeline: SHARED_TIMELINE,
  },
  {
    id: "INC-2184",
    title: "Chemical splash — eyes (first aid)",
    description: "First aid case reported by A. Reed",
    site: "Plant B · Chem Store",
    severity: "First Aid",
    stage: "Corrective",
    state: "Open",
    reportedAt: "2026-04-22 11:05",
    reporter: "A. Reed",
    assignee: "J. Harris",
    injury: "First aid",
    summary:
      "Chemical splash to eyes during decanting. Eyewash used immediately; occupational health cleared the worker the same day.",
    capas: [SHARED_CAPA],
    timeline: SHARED_TIMELINE,
  },
  {
    id: "INC-2170",
    title: "Slip on wet floor — pack line",
    description: "Recordable injury reported by Ops Safety",
    site: "Plant A · Pack",
    severity: "Recordable",
    stage: "Closed",
    state: "Closed",
    reportedAt: "2026-04-18 08:22",
    reporter: "Ops Safety",
    assignee: "M. Price",
    injury: "Recordable",
    summary:
      "Operator slipped on wet pack-line floor after washdown. Floor mats and drip trays installed; case closed after corrective verification.",
    capas: [],
    timeline: SHARED_TIMELINE,
  },
  {
    id: "INC-2155",
    title: "Hand laceration — blade change",
    description: "Lost time injury reported by Line Lead",
    site: "Plant A · Line 1",
    severity: "Lost Time",
    stage: "Investigating",
    state: "Open",
    reportedAt: "2026-04-16 16:10",
    reporter: "Line Lead",
    assignee: "Sarah Mitchell",
    injury: "Lost time",
    summary:
      "Hand laceration during blade change on cutter station. Cut-resistant gloves and blade-change SOP under review.",
    capas: [SHARED_CAPA],
    timeline: SHARED_TIMELINE,
  },
  {
    id: "INC-2140",
    title: "Scaffolding tip incident",
    description: "Serious injury accident reported by Site Ops",
    site: "Plant B · Roof",
    severity: "SIA",
    stage: "New",
    state: "Open",
    reportedAt: "2026-04-15 07:55",
    reporter: "Site Ops",
    assignee: "Sarah Mitchell",
    injury: "Serious injury",
    summary:
      "Scaffolding tip during roof maintenance. Work stopped site-wide pending structural assessment and SIA investigation.",
    capas: [],
    timeline: SHARED_TIMELINE,
  },
];
