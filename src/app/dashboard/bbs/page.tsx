"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { BbsAtRiskBehaviorsCard } from "@/components/bbs/BbsAtRiskBehaviorsCard";
import { BbsEngagementCard } from "@/components/bbs/BbsEngagementCard";
import { BbsMetricsSection } from "@/components/bbs/BbsMetricsSection";
import { BbsPageSkeleton } from "@/components/bbs/BbsPageSkeleton";
import { BbsRecentSessionsSection } from "@/components/bbs/BbsRecentSessionsSection";
import {
  DEFAULT_BBS_GRAPH_WEEKS,
  DEFAULT_BBS_PAGE_NUMBER,
  DEFAULT_BBS_PAGE_SIZE,
  useBbsAtRiskCategoriesQuery,
  useBbsDashboardKpiQuery,
  useBbsGraphQuery,
  useBbsObservationsQuery,
} from "@/hooks/use-bbs-queries";

export default function BbsPage() {
  const kpiQuery = useBbsDashboardKpiQuery();
  const graphQuery = useBbsGraphQuery(DEFAULT_BBS_GRAPH_WEEKS);
  const atRiskQuery = useBbsAtRiskCategoriesQuery();
  const sessionsQuery = useBbsObservationsQuery({
    observe: "",
    pageNumber: DEFAULT_BBS_PAGE_NUMBER,
    pageSize: DEFAULT_BBS_PAGE_SIZE,
  });

  const isBootLoading =
    (kpiQuery.isPending && !kpiQuery.data) ||
    (graphQuery.isPending && !graphQuery.data) ||
    (atRiskQuery.isPending && !atRiskQuery.data) ||
    (sessionsQuery.isPending && !sessionsQuery.data);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Proactive Safety"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      {isBootLoading ? (
        <BbsPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          {/* KPI Metrics */}
          <BbsMetricsSection />

          {/* Engagement trend + at-risk breakdown — stretched to equal height. */}
          <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
            <BbsEngagementCard />
            <BbsAtRiskBehaviorsCard />
          </div>

          {/* Search + recent sessions */}
          <BbsRecentSessionsSection />
        </div>
      )}
    </div>
  );
}
