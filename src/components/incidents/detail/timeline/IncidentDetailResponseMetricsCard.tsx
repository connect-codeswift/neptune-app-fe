"use client";

import { Text } from "@/components/Text";
import type { MetricRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { MetricRow };

export type IncidentDetailResponseMetricsCardProps = Readonly<{
  metrics?: readonly MetricRow[];
  className?: string;
}>;

export function IncidentDetailResponseMetricsCard(
  props: Readonly<IncidentDetailResponseMetricsCardProps>,
) {
  // No placeholder durations: these read as measured response times, and an
  // invented "22 min" is indistinguishable from a real one on an incident
  // record. When there is nothing to show, say so.
  const { metrics = [], className = "" } = props;

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

      {metrics.length === 0 ? (
        <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px] text-sm">
          No response metrics recorded for this incident.
        </div>
      ) : (
        metrics.map((metric) => (
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
        ))
      )}
    </IncidentGlassCard>
  );
}
