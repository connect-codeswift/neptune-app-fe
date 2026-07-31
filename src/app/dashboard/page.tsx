import {
  ComplianceDeadlinesCard,
  RECENT_ACTIVITY_ITEMS,
} from "@/components/ComplianceDeadlinesCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardKpiMetrics } from "@/components/DashboardKpiMetrics";
import { DashboardMyActionsCard } from "@/components/DashboardMyActionsCard";
import { HazardsByCategoryCard } from "@/components/HazardsByCategoryCard";
import { IncidentTrendsCard } from "@/components/IncidentTrendsCard";
import { TrainingComplianceCard } from "@/components/TrainingComplianceCard";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="EHS Command Center" />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-8">
        <DashboardKpiMetrics />
        <div className="grid gap-4 lg:grid-cols-8">
          <IncidentTrendsCard className="lg:col-span-5" />
          <HazardsByCategoryCard className="lg:col-span-3" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TrainingComplianceCard />
          <ComplianceDeadlinesCard />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardMyActionsCard />
          <ComplianceDeadlinesCard
            title="Recent Activity"
            subtitle="Live feed"
            items={RECENT_ACTIVITY_ITEMS}
            viewAllHref="/dashboard/incidents/list"
            showDividers
          />
        </div>
      </div>
    </div>
  );
}
