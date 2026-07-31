import { HazcomModuleTabs, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomOverviewStatsRow } from "@/components/hazcom/overview/HazcomOverviewStatsRow";
import { HazcomRecentChemicalAdditionsCard } from "@/components/hazcom/overview/HazcomRecentChemicalAdditionsCard";
import { HazcomSdsStatusOverviewCard } from "@/components/hazcom/overview/HazcomSdsStatusOverviewCard";
import { HazcomTrainingComplianceCard } from "@/components/hazcom/overview/HazcomTrainingComplianceCard";
import { HazcomUpcomingDeadlinesCard } from "@/components/hazcom/overview/HazcomUpcomingDeadlinesCard";

export type HazcomOverviewViewProps = Readonly<{
  className?: string;
}>;

export function HazcomOverviewView(props: Readonly<HazcomOverviewViewProps>) {
  const { className = "" } = props;

  return (
    <div
      className={["flex min-h-screen flex-1 flex-col gap-5 px-4 py-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomPageHeader breadcrumb={["HazCom"]} title="HazCom Dashboard" />
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
