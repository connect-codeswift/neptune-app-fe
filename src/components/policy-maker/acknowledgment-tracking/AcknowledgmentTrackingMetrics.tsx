"use client";

import { AcknowledgmentMetricCard } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentMetricCard";
import type { AcknowledgmentTrackingMetric } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export type AcknowledgmentTrackingMetricsProps = Readonly<{
  metrics: readonly AcknowledgmentTrackingMetric[];
  className?: string;
}>;

/**
 * Metric row (Figma 5568:25499) — 18px gap, 4 equal cards.
 */
export function AcknowledgmentTrackingMetrics(
  props: Readonly<AcknowledgmentTrackingMetricsProps>,
) {
  const { metrics, className = "" } = props;

  return (
    <div
      className={[
        "grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-[18px] lg:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <AcknowledgmentMetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
