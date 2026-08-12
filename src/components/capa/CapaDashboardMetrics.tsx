"use client";

import {
  MetricCardsRow,
  MetricCardsRowSkeleton,
} from "@/components/ui/MetricCard";
import { CAPA_DASHBOARD_KPIS } from "@/components/capa/capa-dashboard-data";
import { useCapaDashboardKpisQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";

/** KPI row — Figma 7123:41940. Loads GET /api/CAPA/dashboard-kpis. */
export function CapaDashboardMetrics() {
  const hasToken = useHasAccessToken();
  const kpisQuery = useCapaDashboardKpisQuery(hasToken === true);

  if (hasToken === null || (hasToken && kpisQuery.isLoading)) {
    return <MetricCardsRowSkeleton />;
  }

  const metrics = kpisQuery.data ?? CAPA_DASHBOARD_KPIS;

  return <MetricCardsRow metrics={metrics} />;
}
