"use client";

import { useMemo } from "react";
import { MetricCardsRow } from "@/components/ui/MetricCard";
import { useWalkTalkDashboardCountsQuery } from "@/hooks/use-walk-talk-queries";
import { toWalkTalkMetricCards } from "@/lib/map-walk-talk";

/** KPI row — GET /api/walkandtalk/dashboard-counts → MetricCards. */
export function WalkTalkMetricsSection() {
  const countsQuery = useWalkTalkDashboardCountsQuery();
  const metrics = useMemo(
    () => toWalkTalkMetricCards(countsQuery.data?.dataModel),
    [countsQuery.data?.dataModel],
  );

  return <MetricCardsRow metrics={metrics} />;
}
