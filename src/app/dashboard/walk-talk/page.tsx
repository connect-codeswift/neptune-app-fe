import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { WalkTalkTrendsCard } from "@/components/walk-talk/WalkTalkTrendsCard";
import { WalkTalkTopFindingsCard } from "@/components/walk-talk/WalkTalkTopFindingsCard";
import { WalkTalkRecentSessionsSection } from "@/components/walk-talk/WalkTalkRecentSessionsSection";
import {
  RECENT_SESSIONS,
  TOP_FINDINGS,
  WALK_TALK_TRENDS,
} from "./walk-talk-data";

const WALK_TALK_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Observations (30d)",
    value: 84,
    trendValue: "+12",
    trendTone: "positive",
  },
  {
    title: "Walk & Talks",
    value: 42,
    trendValue: "+6",
    trendTone: "positive",
  },
];

export default function WalkAndTalkPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Walk & Talk"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {WALK_TALK_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Trends + top findings — stretched to equal height. */}
        <div className="grid min-w-0 gap-3.5 xl:grid-cols-2">
          <WalkTalkTrendsCard points={WALK_TALK_TRENDS} />
          <WalkTalkTopFindingsCard findings={TOP_FINDINGS} />
        </div>

        {/* Search + recent sessions */}
        <WalkTalkRecentSessionsSection sessions={RECENT_SESSIONS} />
      </div>
    </div>
  );
}
