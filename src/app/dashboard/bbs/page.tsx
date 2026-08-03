import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { BbsAtRiskBehaviorsCard } from "@/components/bbs/BbsAtRiskBehaviorsCard";
import { BbsEngagementCard } from "@/components/bbs/BbsEngagementCard";
import { BbsRecentSessionsSection } from "@/components/bbs/BbsRecentSessionsSection";
import {
  AT_RISK_BEHAVIORS,
  ENGAGEMENT_SERIES,
  RECENT_SESSIONS,
} from "./bbs-data";

const BBS_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Observations (30d)",
    value: 84,
    trendValue: "+12",
    trendTone: "positive",
  },
  {
    title: "Safe behavior %",
    value: "89%",
    trendValue: "+2pp",
    trendTone: "positive",
  },
  {
    title: "At risk",
    value: 31,
    trendValue: "+4",
    trendTone: "positive",
  },
];

export default function BbsPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Proactive Safety"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {BBS_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Engagement trend + at-risk breakdown — stretched to equal height. */}
        <div className="grid min-w-0 gap-3.5 xl:grid-cols-2">
          <BbsEngagementCard points={ENGAGEMENT_SERIES} />
          <BbsAtRiskBehaviorsCard categories={AT_RISK_BEHAVIORS} />
        </div>

        {/* Search + recent sessions */}
        <BbsRecentSessionsSection sessions={RECENT_SESSIONS} />
      </div>
    </div>
  );
}
