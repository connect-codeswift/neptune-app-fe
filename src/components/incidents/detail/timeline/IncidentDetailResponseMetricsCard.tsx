"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type MetricRow = Readonly<{
  label: string;
  value: string;
}>;

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

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[15px] font-bold"
      >
        Response metrics
      </Text>

      <div className="flex flex-col gap-0.5 pt-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between border-b border-[rgba(15,23,42,0.04)] py-2.5 last:border-b-0 text-[12px]"
          >
            <span className="text-ehs-muted-text">{metric.label}</span>
            <span className="font-bold text-ehs-dark-bg">{metric.value}</span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
