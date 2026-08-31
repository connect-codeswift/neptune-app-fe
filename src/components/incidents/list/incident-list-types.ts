import type { MetricCardProps } from "@/components/ui/MetricCard";

/** A KPI card in the incident list header, keyed by a stable id. */
export type IncidentListKpiMetric = MetricCardProps &
  Readonly<{
    id: string;
    /** Weeks spanned by `delta`. 1 = week-over-week. */
    deltaWeeks?: number;
  }>;

export type IncidentSeverity =
  | "Lost Time"
  | "Near Miss"
  | "First Aid"
  | "Recordable"
  | "SIA"
  | "SIP"
  | (string & {});

export type IncidentState = "Open" | "Closed" | (string & {});

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
  numericId: number;
  title: string;
  description: string;
  site: string;
  severity: IncidentSeverity;
  state: IncidentState;
  reportedAt: string;
  reporter: string;
  assignee: string;
  injury: string;
  summary: string;
  /** Raw incident datetime from the API, used for header date-range filtering. */
  incidentAt: string | null;
  isOshaRecordable: boolean;
  /** True when a near miss or hazard was converted into this incident. */
  isConverted: boolean;
  capas: readonly IncidentCapa[];
  timeline: readonly IncidentTimelineItem[];
}>;
