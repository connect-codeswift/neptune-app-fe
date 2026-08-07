"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatMetricCard } from "@/components/StatMetricCard";
import { AuditsViewTabs } from "@/components/audits/AuditsViewTabs";
import { AuditPageSkeleton } from "@/components/audits/AuditPageSkeleton";
import { useAuditSummaryQuery } from "@/hooks/use-audit-queries";
import { mapSummaryToMetrics } from "@/lib/map-audit-inspection-dashboard";
import { getCurrentUser } from "@/lib/current-user";

export function AuditsDashboardPageClient() {
  const { userId } = getCurrentUser();
  const summaryQuery = useAuditSummaryQuery(userId);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "audit"),
    [summaryQuery.data],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Audits" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <AuditsViewTabs />

        {summaryQuery.isPending ? (
          <AuditPageSkeleton />
        ) : (
          <>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>

            {summaryQuery.isError ? (
              <p className="text-ehs-red text-sm">Could not load audit KPIs.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
