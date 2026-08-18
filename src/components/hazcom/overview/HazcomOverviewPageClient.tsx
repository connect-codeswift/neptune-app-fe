"use client";

import {
  HazcomErrorCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomUnavailablePanel,
} from "@/components/hazcom/shared";
import { HazcomOverviewSkeleton } from "@/components/hazcom/overview/HazcomOverviewSkeleton";
import { HazcomOverviewStatsRow } from "@/components/hazcom/overview/HazcomOverviewStatsRow";
import { HazcomRecentChemicalAdditionsCard } from "@/components/hazcom/overview/HazcomRecentChemicalAdditionsCard";
import { HazcomSdsStatusOverviewCard } from "@/components/hazcom/overview/HazcomSdsStatusOverviewCard";
import { useHazcomOverview } from "@/hooks/use-hazcom-overview";

/**
 * The overview now reads from the module's real endpoints, so unlike the fixture
 * version it has states to handle: pending, failed, and signed out. It had none
 * before because hard-coded numbers always render.
 */
export function HazcomOverviewPageClient() {
  const overview = useHazcomOverview();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 px-4 pb-8">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Overview"]}
        title="HazCom Overview"
        subtitle="Chemical inventory health, SDS status, and compliance at a glance"
      />

      {overview.isLoading ? (
        <HazcomOverviewSkeleton />
      ) : overview.errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load the HazCom overview"
          message={overview.errorMessage}
          onRetry={overview.refetch}
        />
      ) : (
        <>
          <HazcomOverviewStatsRow overview={overview} />

          <div className="grid gap-4 xl:grid-cols-2">
            <HazcomRecentChemicalAdditionsCard overview={overview} />
            <HazcomSdsStatusOverviewCard overview={overview} />
            <HazcomUnavailablePanel
              title="Training Compliance"
              message="Per-employee compliance needs a trainee roster and role requirements, which the training endpoint doesn't return yet."
            />
            <HazcomUnavailablePanel
              title="Upcoming Deadlines"
              message="Compliance deadlines will appear here once the API serves them for this site."
            />
          </div>
        </>
      )}
    </div>
  );
}
