"use client";

import { useMemo } from "react";
import { StatMetricCard } from "@/components/StatMetricCard";
import { useBbsDashboardKpiQuery } from "@/hooks/use-bbs-queries";
import { toBbsMetricCards } from "@/lib/map-bbs";

/** KPI row — GET /api/bbs/dashboard-kpi → StatMetricCards. */
export function BbsMetricsSection() {
  const kpiQuery = useBbsDashboardKpiQuery();
  const metrics = useMemo(
    () => toBbsMetricCards(kpiQuery.data?.dataModel),
    [kpiQuery.data?.dataModel],
  );

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <StatMetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
