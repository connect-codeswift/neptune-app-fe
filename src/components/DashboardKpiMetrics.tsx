"use client";

import { useSyncExternalStore } from "react";
import { KpiMetricsRowSkeleton } from "@/components/DashboardSkeletons";
import { DEFAULT_KPI_METRICS, KpiMetricsRow } from "@/components/KpiMetricCard";
import { useMainDashboardKpisQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";
import { mapDashboardKpisToMetrics } from "@/services/mappers/dashboard.mapper";

/** No-op subscribe: the access token doesn't change during a page view. */
const subscribeToNothing = () => () => {};

/**
 * KPI row (Figma dashboard header cards). Loads live values from
 * GET /api/EHSCommandCenter/GetMainDashboardKpis — TRIR/LTIR use the
 * shared OSHA rate engine; compliance and CAPA use site-scoped counts.
 */
export function DashboardKpiMetrics() {
  // `null` until hydrated, so the skeleton also covers the first paint on a
  // hard refresh — not just the fetch.
  const hasToken = useSyncExternalStore(
    subscribeToNothing,
    () => Boolean(getAccessToken()),
    () => null,
  );

  const kpisQuery = useMainDashboardKpisQuery(hasToken === true);

  if (hasToken === null || (hasToken && kpisQuery.isLoading)) {
    return <KpiMetricsRowSkeleton />;
  }

  const metrics = kpisQuery.data?.dataModel
    ? mapDashboardKpisToMetrics(kpisQuery.data.dataModel)
    : DEFAULT_KPI_METRICS;

  return (
    <div className="flex flex-col gap-3">
      <KpiMetricsRow metrics={metrics} />
    </div>
  );
}
