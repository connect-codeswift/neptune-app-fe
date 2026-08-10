"use client";

import { useMemo } from "react";
import { StatMetricCard } from "@/components/StatMetricCard";
import { useWalkTalkDashboardCountsQuery } from "@/hooks/use-walk-talk-queries";
import { toWalkTalkMetricCards } from "@/lib/map-walk-talk";

/** KPI row — GET /api/walkandtalk/dashboard-counts → StatMetricCards. */
export function WalkTalkMetricsSection() {
  const countsQuery = useWalkTalkDashboardCountsQuery();
  const metrics = useMemo(
    () => toWalkTalkMetricCards(countsQuery.data?.dataModel),
    [countsQuery.data?.dataModel],
  );

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <StatMetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
