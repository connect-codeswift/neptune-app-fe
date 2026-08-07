"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { NearMissHeatmapCard } from "@/components/near-miss/NearMissHeatmapCard";
import { NearMissRecognitionCard } from "@/components/near-miss/NearMissRecognitionCard";
import { NearMissPageSkeleton } from "@/components/near-miss/NearMissPageSkeleton";
import { NearMissViewTabs } from "@/components/near-miss/NearMissViewTabs";
import { useNearMissKpiQuery } from "@/hooks/use-near-miss-queries";
import { canViewNearMissInsights } from "@/lib/current-user";

export function NearMissDashboardPageClient() {
  const [canViewInsights, setCanViewInsights] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanViewInsights(canViewNearMissInsights());
  }, []);

  const nearMissKpiQuery = useNearMissKpiQuery(canViewInsights);
  const kpi = nearMissKpiQuery.data?.dataModel;

  const metrics: readonly StatMetricCardProps[] = [
    {
      title: "Total near misses",
      value: kpi?.totalNearMissCount ?? 0,
    },
    {
      title: "Converted to incidents",
      value: kpi?.convertedToIncidents ?? 0,
    },
  ];

  const isLoading = canViewInsights && nearMissKpiQuery.isPending;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Near Miss Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <NearMissViewTabs />

        {isLoading ? (
          <NearMissPageSkeleton />
        ) : canViewInsights ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>

            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
              <NearMissHeatmapCard />
              <NearMissRecognitionCard />
            </div>
          </>
        ) : (
          <p className="text-ehs-muted-text text-sm">
            Near miss insights are available to elevated safety roles.
          </p>
        )}
      </div>
    </div>
  );
}
