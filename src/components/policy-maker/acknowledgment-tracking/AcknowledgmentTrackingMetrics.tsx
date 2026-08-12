"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import type { AcknowledgmentTrackingMetric } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export type AcknowledgmentTrackingMetricsProps = Readonly<{
  metrics: readonly AcknowledgmentTrackingMetric[];
  className?: string;
}>;

/** Metric row (Figma 5568:25499) — 4 equal cards. */
export function AcknowledgmentTrackingMetrics(
  props: Readonly<AcknowledgmentTrackingMetricsProps>,
) {
  const { metrics, className = "" } = props;

  return (
    <div
      className={[
        "stagger-cards grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  );
}
