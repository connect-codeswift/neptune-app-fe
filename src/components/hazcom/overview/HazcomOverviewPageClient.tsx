"use client";

import {
  HazcomErrorCard,
  HazcomModuleTabs,
} from "@/components/hazcom/shared";
import { HazcomOverviewSkeleton } from "@/components/hazcom/overview/HazcomOverviewSkeleton";
import { HazcomOverviewStatsRow } from "@/components/hazcom/overview/HazcomOverviewStatsRow";
import { HazcomRecentChemicalAdditionsCard } from "@/components/hazcom/overview/HazcomRecentChemicalAdditionsCard";
import { HazcomSdsStatusOverviewCard } from "@/components/hazcom/overview/HazcomSdsStatusOverviewCard";
import { HazcomTrainingComplianceCard } from "@/components/hazcom/overview/HazcomTrainingComplianceCard";
import { HazcomUpcomingDeadlinesCard } from "@/components/hazcom/overview/HazcomUpcomingDeadlinesCard";
import { useHazcomOverview } from "@/hooks/use-hazcom-overview";

/**
 * The overview now reads from the module's real endpoints, so unlike the fixture
 * version it has states to handle: pending, failed, and signed out. It had none
 * before because hard-coded numbers always render.
 */
export function HazcomOverviewPageClient() {
  const overview = useHazcomOverview();

  return (
    <div className="flex min-h-screen flex-1 flex-col px-4 pb-4">
      <HazcomModuleTabs />

      {overview.isLoading ? (
        <div className="mt-4">
          <HazcomOverviewSkeleton />
        </div>
      ) : overview.errorMessage ? (
        <div className="mt-4">
          <HazcomErrorCard
            title="Couldn’t load the HazCom overview"
            message={overview.errorMessage}
            onRetry={overview.refetch}
          />
        </div>
      ) : (
        <>
          <HazcomOverviewStatsRow overview={overview} />

          <div className="grid gap-4 xl:grid-cols-2">
            <HazcomRecentChemicalAdditionsCard overview={overview} />
            <HazcomSdsStatusOverviewCard overview={overview} />
            <HazcomTrainingComplianceCard />
            <HazcomUpcomingDeadlinesCard />
          </div>
        </>
      )}
    </div>
  );
}
