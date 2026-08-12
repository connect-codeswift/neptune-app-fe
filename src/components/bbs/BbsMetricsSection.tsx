"use client";

import { useMemo } from "react";
import { MetricCardsRow } from "@/components/ui/MetricCard";
import { useBbsDashboardKpiQuery } from "@/hooks/use-bbs-queries";
import { toBbsMetricCards } from "@/lib/map-bbs";

/** KPI row — GET /api/bbs/dashboard-kpi → MetricCards. */
export function BbsMetricsSection() {
  const kpiQuery = useBbsDashboardKpiQuery();
  const metrics = useMemo(
    () => toBbsMetricCards(kpiQuery.data?.dataModel),
    [kpiQuery.data?.dataModel],
  );

  return <MetricCardsRow metrics={metrics} />;
}
