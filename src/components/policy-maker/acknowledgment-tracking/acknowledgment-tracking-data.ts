import type {
  AcknowledgmentRecord,
  AcknowledgmentTrackingMetric,
} from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

/** Mock rows matching Figma 5568:25528 (+ 4th ack to match 67% / 4 of 6). */
export const ACKNOWLEDGMENT_RECORDS: readonly AcknowledgmentRecord[] = [
  {
    id: "ack-james",
    name: "James Carter",
    department: "Production",
    status: "Acknowledged",
    acknowledgedDate: "2025-01-15",
  },
  {
    id: "ack-maria",
    name: "Maria Lopez",
    department: "Production",
    status: "Acknowledged",
    acknowledgedDate: "2025-01-16",
  },
  {
    id: "ack-tom",
    name: "Tom Bradley",
    department: "Maintenance",
    status: "Acknowledged",
    acknowledgedDate: "2025-01-14",
  },
  {
    id: "ack-sarah",
    name: "Sarah Mitchell",
    department: "EHS",
    status: "Acknowledged",
    acknowledgedDate: "2025-01-16",
  },
  {
    id: "ack-anna",
    name: "Anna Wang",
    department: "Production",
    status: "Pending",
    acknowledgedDate: null,
  },
  {
    id: "ack-carlos",
    name: "Carlos Ruiz",
    department: "Production",
    status: "Pending",
    acknowledgedDate: null,
  },
];

export function getAcknowledgmentMetrics(
  records: readonly AcknowledgmentRecord[],
): readonly AcknowledgmentTrackingMetric[] {
  const acknowledged = records.filter(
    (row) => row.status === "Acknowledged",
  ).length;
  const pending = records.filter((row) => row.status === "Pending").length;
  const total = records.length;
  const rate =
    total > 0 ? Math.round((acknowledged / total) * 100) : 0;

  return [
    { id: "acknowledged", value: String(acknowledged), label: "Acknowledged" },
    { id: "pending", value: String(pending), label: "Pending" },
    { id: "completion", value: `${String(rate)}%`, label: "Completion Rate" },
    { id: "last-activity", value: "Today", label: "Last Activity" },
  ];
}

export function getAcknowledgmentRecordsForDocument(
  _documentId: string,
): readonly AcknowledgmentRecord[] {
  return ACKNOWLEDGMENT_RECORDS;
}
