export type AcknowledgmentStatus = "Acknowledged" | "Pending";

export type AcknowledgmentRecord = Readonly<{
  id: string;
  name: string;
  department: string;
  status: AcknowledgmentStatus;
  acknowledgedDate: string | null;
}>;

export type AcknowledgmentTrackingMetric = Readonly<{
  id: string;
  value: string;
  label: string;
}>;
