import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";

const NEAR_MISS_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Total near misses",
    value: 32,
    trendValue: "-4",
    trendTone: "negative",
  },
  {
    title: "Converted to incidents",
    value: 48,
    trendValue: "+12",
    trendTone: "positive",
  },
];

export default function NearMissPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        title="Near Miss Reporting"
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />
      <div className="flex-1 px-4 pb-8">
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {NEAR_MISS_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
