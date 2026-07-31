import { HazcomModuleTabs } from "@/components/hazcom/shared";
import { HazcomOverviewStatsRow } from "@/components/hazcom/overview/HazcomOverviewStatsRow";
import { HazcomRecentChemicalAdditionsCard } from "@/components/hazcom/overview/HazcomRecentChemicalAdditionsCard";
import { HazcomSdsStatusOverviewCard } from "@/components/hazcom/overview/HazcomSdsStatusOverviewCard";
import { HazcomTrainingComplianceCard } from "@/components/hazcom/overview/HazcomTrainingComplianceCard";
import { HazcomUpcomingDeadlinesCard } from "@/components/hazcom/overview/HazcomUpcomingDeadlinesCard";

export default function HazcomOverviewPage() {
  return (
    <div
      className={["flex min-h-screen flex-1 flex-col px-4 pb-4"]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />
      <HazcomOverviewStatsRow />

      <div className="grid gap-4 xl:grid-cols-2">
        <HazcomRecentChemicalAdditionsCard />
        <HazcomSdsStatusOverviewCard />
        <HazcomTrainingComplianceCard />
        <HazcomUpcomingDeadlinesCard />
      </div>
    </div>
  );
}
