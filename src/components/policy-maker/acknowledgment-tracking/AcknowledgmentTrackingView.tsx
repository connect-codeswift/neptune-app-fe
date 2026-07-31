"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { AcknowledgmentTrackingHeader } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentTrackingHeader";
import { AcknowledgmentTrackingMetrics } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentTrackingMetrics";
import { AcknowledgmentTrackingTable } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentTrackingTable";
import type {
  AcknowledgmentRecord,
  AcknowledgmentTrackingMetric,
} from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

export type AcknowledgmentTrackingViewProps = Readonly<{
  document: PolicyDocument;
  records: readonly AcknowledgmentRecord[];
  metrics: readonly AcknowledgmentTrackingMetric[];
}>;

/**
 * Acknowledgment Tracking screen (Figma 5568:25460).
 */
export function AcknowledgmentTrackingView(
  props: Readonly<AcknowledgmentTrackingViewProps>,
) {
  const { document, records, metrics } = props;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs…"
        searchonleft
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        onDateRangeClick={() =>
          toast.success("Date range", "Date filter coming soon.")
        }
        onNotificationsClick={() =>
          toast.success("Notifications", "Notifications coming soon.")
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-3.5 sm:px-4 sm:pb-8">
        <AcknowledgmentTrackingHeader document={document} />
        <AcknowledgmentTrackingMetrics metrics={metrics} />
        <AcknowledgmentTrackingTable records={records} />
      </div>
    </div>
  );
}
