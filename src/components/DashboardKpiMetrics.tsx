"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { DEFAULT_KPI_METRICS, KpiMetricsRow } from "@/components/KpiMetricCard";
import { Text } from "@/components/Text";
import { useMainDashboardKpisQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";
import { mapDashboardKpisToMetrics } from "@/services/mappers/dashboard.mapper";

/**
 * KPI row (Figma dashboard header cards). Loads live values from
 * GET /api/EHSCommandCenter/GetMainDashboardKpis; trend/target/sparkline
 * decoration comes from DEFAULT_KPI_METRICS since the API has no history.
 */
export function DashboardKpiMetrics() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const kpisQuery = useMainDashboardKpisQuery(isClientReady && hasToken);

  const showLoading =
    !isClientReady || (hasToken && kpisQuery.isLoading);

  if (showLoading) {
    return (
      <IncidentGlassCard className="min-h-[140px] items-center justify-center gap-2 text-center">
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-8 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text-ehs-muted-text text-sm">
          Loading KPIs…
        </Text>
      </IncidentGlassCard>
    );
  }

  const metrics = kpisQuery.data?.dataModel
    ? mapDashboardKpisToMetrics(kpisQuery.data.dataModel)
    : DEFAULT_KPI_METRICS;

  return <KpiMetricsRow metrics={metrics} />;
}
