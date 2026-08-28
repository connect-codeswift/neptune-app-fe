"use client";

import { useSyncExternalStore } from "react";
import {
  MetricCardsRow,
  MetricCardsRowSkeleton,
} from "@/components/ui/MetricCard";
import { useMainDashboardKpisQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";
import { useCapabilities } from "@/lib/capabilities";
import {
  DEFAULT_DASHBOARD_KPIS,
  mapDashboardKpisToMetrics,
} from "@/services/mappers/dashboard.mapper";

/** No-op subscribe: the access token doesn't change during a page view. */
const subscribeToNothing = () => () => {};

/**
 * KPI row (Figma dashboard header cards). Loads live values from
 * GET /api/v1/command-center/dashboard-kpis — TRIR/LTIR use the
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

  // Both command-center reads require CommandCenter.View, which a Worker does not hold.
  // Rendered anyway they fetch, 403 and print the failure on the dashboard - the same defect
  // as the trends card beside them. Hiding is a UX affordance; the API still refuses.
  const { can, isReady } = useCapabilities();
  const isPermitted = !isReady || can("CommandCenter.View");

  const kpisQuery = useMainDashboardKpisQuery(hasToken === true && isPermitted);

  if (hasToken === null || (hasToken && isPermitted && kpisQuery.isLoading)) {
    return <MetricCardsRowSkeleton />;
  }

  if (!isPermitted) {
    return null;
  }

  const metrics = kpisQuery.data?.dataModel
    ? mapDashboardKpisToMetrics(kpisQuery.data.dataModel)
    : DEFAULT_DASHBOARD_KPIS;

  return (
    <div className="flex flex-col gap-3">
      <MetricCardsRow metrics={metrics} />
    </div>
  );
}
