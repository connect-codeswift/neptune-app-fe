import {
  ComplianceDeadlinesCard,
  RECENT_ACTIVITY_ITEMS,
} from "@/components/ComplianceDeadlinesCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardKpiMetrics } from "@/components/DashboardKpiMetrics";
import { DashboardMyActionsCard } from "@/components/DashboardMyActionsCard";
import { HazardsByCategoryCard } from "@/components/HazardsByCategoryCard";
import { IncidentTrendsCard } from "@/components/IncidentTrendsCard";
import { InspectionRatesCard } from "@/components/InspectionRatesCard";

/**
 * EHS Command Center (Figma node 6154:26792).
 *
 * The Figma canvas lays the main column out on a 1150px grid with a flat 14px
 * gutter: four KPI cards, then a 699/437 split, then two equal-halves rows.
 * That split is 8:5 of thirteen columns, which is what `grid-cols-13` below
 * reproduces so the proportion holds at any width instead of only at 1440px.
 */
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="EHS Command Center" />

      <div className="flex flex-1 flex-col gap-[14px] px-4 pb-8">
        <DashboardKpiMetrics />

        {/* stagger-cards offsets each row's second card, so a row settles left
            to right rather than both halves appearing at once. */}
        <div className="stagger-cards grid gap-[14px] lg:grid-cols-13">
          <IncidentTrendsCard className="lg:col-span-8" />
          <HazardsByCategoryCard className="lg:col-span-5" />
        </div>

        <div className="stagger-cards grid gap-[14px] lg:grid-cols-2">
          <InspectionRatesCard />
          <ComplianceDeadlinesCard />
        </div>

        <div className="stagger-cards grid gap-[14px] lg:grid-cols-2">
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
