"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { WalkTalkMetricsSection } from "@/components/walk-talk/WalkTalkMetricsSection";
import { WalkTalkPageSkeleton } from "@/components/walk-talk/WalkTalkPageSkeleton";
import { WalkTalkRecentSessionsSection } from "@/components/walk-talk/WalkTalkRecentSessionsSection";
import { WalkTalkTopFindingsCard } from "@/components/walk-talk/WalkTalkTopFindingsCard";
import { WalkTalkTrendsCard } from "@/components/walk-talk/WalkTalkTrendsCard";
import {
  DEFAULT_WALK_TALK_GRAPH_WEEKS,
  useWalkTalkDashboardCountsQuery,
  useWalkTalkGraphQuery,
  useWalkTalkTopFindingsQuery,
} from "@/hooks/use-walk-talk-queries";

/**
 * Single Walk & Talk page — cards → charts → filters → search → recent sessions.
 */
export function WalkTalkListPageClient() {
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

        <WalkTalkRecentSessionsSection />
      </div>
    </div>
  );
}
