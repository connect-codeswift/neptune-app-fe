"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { HazardHeatmapCard } from "@/components/hazard/HazardHeatmapCard";
import { HazardRecognitionCard } from "@/components/hazard/HazardRecognitionCard";
import { HazardPageSkeleton } from "@/components/hazard/HazardPageSkeleton";
import { HazardViewTabs } from "@/components/hazard/HazardViewTabs";
import { useHazardKpiQuery } from "@/hooks/use-hazard-queries";
import { canViewHazardInsights, getCurrentUser } from "@/lib/current-user";
import { mapHazardKpiToMetrics } from "@/lib/map-hazard";

export function HazardDashboardPageClient() {
  const { userId } = getCurrentUser();

  const [canViewInsights, setCanViewInsights] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanViewInsights(canViewHazardInsights());
  }, []);

  const kpiQuery = useHazardKpiQuery({ userId }, canViewInsights);

  const metrics: readonly StatMetricCardProps[] = useMemo(
    () => mapHazardKpiToMetrics(kpiQuery.data?.dataModel),
    [kpiQuery.data],
  );

  const isLoading = canViewInsights && kpiQuery.isPending;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Hazard Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <HazardViewTabs />

        {isLoading ? (
          <HazardPageSkeleton />
        ) : canViewInsights ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>

            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
              <HazardHeatmapCard />
              <HazardRecognitionCard />
            </div>
          </>
        ) : (
          <p className="text-ehs-muted-text text-sm">
            Hazard insights are available to elevated safety roles.
          </p>
        )}
      </div>
    </div>
  );
}
