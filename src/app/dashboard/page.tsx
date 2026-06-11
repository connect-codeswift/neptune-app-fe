import {
  ComplianceDeadlinesCard,
  MY_ACTIONS_ITEMS,
  RECENT_ACTIVITY_ITEMS,
} from "@/components/ComplianceDeadlinesCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HazardsByCategoryCard } from "@/components/HazardsByCategoryCard";
import { IncidentTrendsCard } from "@/components/IncidentTrendsCard";
import { KpiMetricsRow } from "@/components/KpiMetricCard";
import { TrainingComplianceCard } from "@/components/TrainingComplianceCard";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-8">
        <KpiMetricsRow />
        <div className="grid gap-4 lg:grid-cols-8">
          <IncidentTrendsCard className="lg:col-span-5" />
          <HazardsByCategoryCard className="lg:col-span-3" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TrainingComplianceCard />
          <ComplianceDeadlinesCard />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ComplianceDeadlinesCard
            title="My Actions"
            subtitle="5 assigned · 2 due this week"
            items={MY_ACTIONS_ITEMS}
            viewAllHref="/dashboard/capa"
          />
          <ComplianceDeadlinesCard
            title="Recent Activity"
            subtitle="Live feed"
            items={RECENT_ACTIVITY_ITEMS}
            viewAllHref="/dashboard/incidents"
            showDividers
          />
        </div>
      </div>
    </div>
  );
}
