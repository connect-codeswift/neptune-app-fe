"use client";

import {
  MetricCardsRow,
  MetricCardsRowSkeleton,
} from "@/components/ui/MetricCard";
import { useCapaDashboardKpisQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useCapabilities } from "@/lib/capabilities";

/**
 * KPI row — Figma 7123:41940. Loads GET /api/v1/capas/dashboard-kpis.
 *
 * Site-wide figures, so it asks for the permission the endpoint enforces and draws nothing
 * without it. A worker reads their own workload from the lifecycle donut and the register
 * below; a site-wide "71 open" above a list of their four would only mislead.
 *
 * Nothing is rendered when the request fails either. This used to fall back to the Figma
 * placeholder constants, so a refused request produced four confident, invented numbers.
 */
export function CapaDashboardMetrics() {
  const hasToken = useHasAccessToken();
  const { can } = useCapabilities();
  const canSeeSiteKpis = can("CAPA.Dashboard.View");
  const kpisQuery = useCapaDashboardKpisQuery(hasToken === true && canSeeSiteKpis);

  if (!canSeeSiteKpis) {
    return null;
  }

  if (hasToken === null || (hasToken && kpisQuery.isLoading)) {
    return <MetricCardsRowSkeleton />;
  }

  if (!kpisQuery.data) {
    return null;
  }

  return <MetricCardsRow metrics={kpisQuery.data} />;
}
