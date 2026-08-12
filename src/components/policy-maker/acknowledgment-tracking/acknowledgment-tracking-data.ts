import type {
  AcknowledgmentRecord,
  AcknowledgmentTrackingMetric,
} from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export function getAcknowledgmentMetrics(
  records: readonly AcknowledgmentRecord[],
  apiCounts?: Readonly<{
    acknowledgedCount?: number | null;
    pendingCount?: number | null;
    completionRate?: number | null;
  }>,
): readonly AcknowledgmentTrackingMetric[] {
  const acknowledged =
    apiCounts?.acknowledgedCount ??
    records.filter((row) => row.status === "Acknowledged").length;
  const pending =
    apiCounts?.pendingCount ??
    records.filter((row) => row.status === "Pending").length;
  const total = records.length;
  const rate =
    apiCounts?.completionRate ??
    (total > 0 ? Math.round((acknowledged / total) * 100) : 0);

  const lastAcknowledgedDate = records
    .filter((row) => row.status === "Acknowledged" && row.acknowledgedDate)
    .map((row) => row.acknowledgedDate)
    .filter(Boolean)
    .sort()
    .pop();

  // Counts for one document — no history and no prior period, so each card
  // shows an icon badge rather than a delta.
  return [
    {
      id: "acknowledged",
      title: "Acknowledged",
      value: String(acknowledged),
      description: `of ${String(total)} assigned`,
      icon: "mdi:check-decagram-outline",
    },
    {
      id: "pending",
      title: "Pending",
      value: String(pending),
      description: "Still awaiting sign-off",
      isMorePositive: false,
      target: 0,
      signalOwnedBy: "target",
      icon: "mdi:clock-outline",
    },
    {
      id: "completion",
      title: "Completion Rate",
      value: String(rate),
      unit: "%",
      target: 100,
      targetLabel: "Target 100%",
      signalOwnedBy: "target",
      icon: "mdi:percent-outline",
    },
    {
      id: "last-activity",
      title: "Last Activity",
      value: lastAcknowledgedDate ?? "—",
      description: "Most recent acknowledgement",
      icon: "mdi:calendar-clock",
    },
  ];
}
