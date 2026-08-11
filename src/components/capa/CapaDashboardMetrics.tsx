"use client";

import { KpiMetricsRow } from "@/components/KpiMetricCard";
import { CAPA_DASHBOARD_KPIS } from "@/components/capa/capa-dashboard-data";

/** KPI row — Figma 7123:41940. */
export function CapaDashboardMetrics() {
  return <KpiMetricsRow metrics={CAPA_DASHBOARD_KPIS} />;
}
