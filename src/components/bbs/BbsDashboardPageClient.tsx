"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { BbsAtRiskBehaviorsCard } from "@/components/bbs/BbsAtRiskBehaviorsCard";
import { BbsEngagementCard } from "@/components/bbs/BbsEngagementCard";
import { BbsMetricsSection } from "@/components/bbs/BbsMetricsSection";
import { BbsPageSkeleton } from "@/components/bbs/BbsPageSkeleton";
import { BbsViewTabs } from "@/components/bbs/BbsViewTabs";
import {
  DEFAULT_BBS_GRAPH_WEEKS,
  useBbsAtRiskCategoriesQuery,
  useBbsDashboardKpiQuery,
  useBbsGraphQuery,
} from "@/hooks/use-bbs-queries";

export function BbsDashboardPageClient() {
  const kpiQuery = useBbsDashboardKpiQuery();
  const graphQuery = useBbsGraphQuery(DEFAULT_BBS_GRAPH_WEEKS);
  const atRiskQuery = useBbsAtRiskCategoriesQuery();

  const isBootLoading =
    (kpiQuery.isPending && !kpiQuery.data) ||
    (graphQuery.isPending && !graphQuery.data) ||
    (atRiskQuery.isPending && !atRiskQuery.data);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Proactive Safety" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <BbsViewTabs />

        {isBootLoading ? (
          <BbsPageSkeleton />
        ) : (
          <>
            <BbsMetricsSection />
            <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
              <BbsEngagementCard />
              <BbsAtRiskBehaviorsCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
