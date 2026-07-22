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
          className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          Response metrics
        </Text>
      </div>

      {rows.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px]"
        >
          <span className="text-[12px] leading-normal text-[#566072]">
            {metric.label}
          </span>
          <span className="text-[13px] leading-normal font-bold text-[#0b1320]">
            {metric.value}
          </span>
        </div>
      ))}
    </IncidentGlassCard>
  );
}
