import type { MetricCardProps } from "@/components/ui/MetricCard";

export type AcknowledgmentStatus = "Acknowledged" | "Pending";

export type AcknowledgmentRecord = Readonly<{
  id: string;
  name: string;
  department: string;
  status: AcknowledgmentStatus;
  acknowledgedDate: string | null;
}>;

/** A KPI card on the acknowledgment tracking header, keyed by a stable id. */
export type AcknowledgmentTrackingMetric = MetricCardProps &
  Readonly<{ id: string }>;
