"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { WalkTalkTrendsCard } from "@/components/walk-talk/WalkTalkTrendsCard";
import { WalkTalkTopFindingsCard } from "@/components/walk-talk/WalkTalkTopFindingsCard";
import { WalkTalkMetricsSection } from "@/components/walk-talk/WalkTalkMetricsSection";
import { WalkTalkPageSkeleton } from "@/components/walk-talk/WalkTalkPageSkeleton";
import { WalkTalkViewTabs } from "@/components/walk-talk/WalkTalkViewTabs";
import {
  DEFAULT_WALK_TALK_GRAPH_WEEKS,
  useWalkTalkDashboardCountsQuery,
  useWalkTalkGraphQuery,
  useWalkTalkTopFindingsQuery,
} from "@/hooks/use-walk-talk-queries";

export function WalkTalkDashboardPageClient() {
  const countsQuery = useWalkTalkDashboardCountsQuery();
  const graphQuery = useWalkTalkGraphQuery(DEFAULT_WALK_TALK_GRAPH_WEEKS);
  const findingsQuery = useWalkTalkTopFindingsQuery();

  const isBootLoading =
    (countsQuery.isPending && !countsQuery.data) ||
    (graphQuery.isPending && !graphQuery.data) ||
    (findingsQuery.isPending && !findingsQuery.data);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Walk & Talk" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <WalkTalkViewTabs />

        {isBootLoading ? (
          <WalkTalkPageSkeleton />
        ) : (
          <>
            <WalkTalkMetricsSection />
            <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
              <WalkTalkTrendsCard />
              <WalkTalkTopFindingsCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
