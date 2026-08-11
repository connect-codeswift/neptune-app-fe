"use client";

import { MetricCardsRow } from "@/components/ui/MetricCard";
import { CAPA_DASHBOARD_KPIS } from "@/components/capa/capa-dashboard-data";

/** KPI row — Figma 7123:41940. */
export function CapaDashboardMetrics() {
  return <MetricCardsRow metrics={CAPA_DASHBOARD_KPIS} />;
}
