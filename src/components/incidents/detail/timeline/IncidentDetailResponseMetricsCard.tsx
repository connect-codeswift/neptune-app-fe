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
    <IncidentGlassCard paddingClassName="p-4.75" className={className}>
      <div className="pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Response metrics
        </Text>
      </div>

      {metrics.length === 0 ? (
        <div className="text-ehs-muted-text text4 border-t border-[rgba(15,23,42,0.08)] pt-2.75 pb-2.5">
          No response metrics recorded for this incident.
        </div>
      ) : (
        metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between border-t border-[rgba(15,23,42,0.08)] pt-2.75 pb-2.5"
          >
            <span className="text-ehs-gray text4 leading-normal">
              {metric.label}
            </span>
            <span className="text-ehs-dark-bg text4 leading-normal font-bold">
              {metric.value}
            </span>
          </div>
        ))
      )}
    </IncidentGlassCard>
  );
}
