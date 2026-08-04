"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { WalkTalkTrendsCard } from "@/components/walk-talk/WalkTalkTrendsCard";
import { WalkTalkTopFindingsCard } from "@/components/walk-talk/WalkTalkTopFindingsCard";
import { WalkTalkRecentSessionsSection } from "@/components/walk-talk/WalkTalkRecentSessionsSection";
import { WalkTalkMetricsSection } from "@/components/walk-talk/WalkTalkMetricsSection";
import { WalkTalkPageSkeleton } from "@/components/walk-talk/WalkTalkPageSkeleton";
import {
  DEFAULT_WALK_TALK_GRAPH_WEEKS,
  DEFAULT_WALK_TALK_PAGE_NUMBER,
  DEFAULT_WALK_TALK_PAGE_SIZE,
  useWalkTalkDashboardCountsQuery,
  useWalkTalkGraphQuery,
  useWalkTalkSessionsQuery,
  useWalkTalkTopFindingsQuery,
} from "@/hooks/use-walk-talk-queries";

export default function WalkAndTalkPage() {
  const countsQuery = useWalkTalkDashboardCountsQuery();
  const graphQuery = useWalkTalkGraphQuery(DEFAULT_WALK_TALK_GRAPH_WEEKS);
  const findingsQuery = useWalkTalkTopFindingsQuery();
  const sessionsQuery = useWalkTalkSessionsQuery({
    pageNumber: DEFAULT_WALK_TALK_PAGE_NUMBER,
    pageSize: DEFAULT_WALK_TALK_PAGE_SIZE,
  });

  const isBootLoading =
    (countsQuery.isPending && !countsQuery.data) ||
    (graphQuery.isPending && !graphQuery.data) ||
    (findingsQuery.isPending && !findingsQuery.data) ||
    (sessionsQuery.isPending && !sessionsQuery.data);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Walk & Talk"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      {isBootLoading ? (
        <WalkTalkPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          {/* KPI Metrics */}
          <WalkTalkMetricsSection />

          {/* Trends + top findings — stretched to equal height. */}
        <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
          <WalkTalkTrendsCard />
          <WalkTalkTopFindingsCard />
        </div>

          {/* Search + recent sessions */}
          <WalkTalkRecentSessionsSection />
        </div>
      )}
    </div>
  );
}
