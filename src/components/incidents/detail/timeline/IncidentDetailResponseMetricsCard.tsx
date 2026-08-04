"use client";

import { Text } from "@/components/Text";
import type { MetricRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { MetricRow };

export type IncidentDetailResponseMetricsCardProps = Readonly<{
  metrics?: readonly MetricRow[];
  className?: string;
}>;

const DEFAULT_METRICS: readonly MetricRow[] = [
  { label: "Time to acknowledge", value: "22 min" },
  { label: "Time to LOTO", value: "30 min" },
  { label: "Time to assign", value: "6 min" },
  { label: "Open duration", value: "4h 12m" },
];

export function IncidentDetailResponseMetricsCard(
  props: Readonly<IncidentDetailResponseMetricsCardProps>,
) {
  const { metrics = DEFAULT_METRICS, className = "" } = props;
  const rows = metrics.length > 0 ? metrics : DEFAULT_METRICS;

  return (
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="pb-[14px]">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Response metrics
        </Text>
      </div>

      {rows.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px]"
        >
          <span className="text-sm leading-normal text-ehs-gray">
            {metric.label}
          </span>
          <span className="text-sm leading-normal font-bold text-ehs-dark-bg">
            {metric.value}
          </span>
        </div>
      ))}
    </IncidentGlassCard>
  );
}
