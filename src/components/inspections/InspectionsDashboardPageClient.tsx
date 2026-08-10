"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatMetricCard } from "@/components/StatMetricCard";
import { InspectionsViewTabs } from "@/components/inspections/InspectionsViewTabs";
import { InspectionPageSkeleton } from "@/components/inspections/InspectionPageSkeleton";
import { useInspectionSummaryQuery } from "@/hooks/use-inspection-queries";
import { mapSummaryToMetrics } from "@/lib/map-audit-inspection-dashboard";
import { getCurrentUser } from "@/lib/current-user";

export function InspectionsDashboardPageClient() {
  const { userId } = getCurrentUser();
  const summaryQuery = useInspectionSummaryQuery(userId);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "inspection"),
    [summaryQuery.data],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Inspections" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <InspectionsViewTabs />

        {summaryQuery.isPending ? (
          <InspectionPageSkeleton />
        ) : (
          <>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>

            {summaryQuery.isError ? (
              <p className="text-ehs-red text-sm">
                Could not load inspection KPIs.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
