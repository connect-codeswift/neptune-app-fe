import { Text } from "@/components/Text";
import { HeroKpiCard } from "@/components/incidents/dashboard/HeroKpiCard";
import { IndicatorCard } from "@/components/incidents/dashboard/IndicatorCard";
import { InjuryMixCard } from "@/components/incidents/dashboard/InjuryMixCard";
import { RecordableInjuriesChart } from "@/components/incidents/dashboard/RecordableInjuriesChart";
import { RecordablesBySiteCard } from "@/components/incidents/dashboard/RecordablesBySiteCard";
import {
  HERO_KPI_METRICS,
  INCIDENT_KPIS_FOOTNOTE,
  INDICATOR_METRICS,
} from "@/components/incidents/dashboard/incident-kpis-data";

export type IncidentKpisDashboardProps = Readonly<{
  className?: string;
}>;

const GRID_INDICATORS = INDICATOR_METRICS.filter(
  (metric) => metric.id !== "hazard-id",
);

const HAZARD_INDICATOR = INDICATOR_METRICS.find(
  (metric) => metric.id === "hazard-id",
);

export function IncidentKpisDashboard(
  props: Readonly<IncidentKpisDashboardProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-6", className].filter(Boolean).join(" ")}
    >
      <div className="grid gap-x-[14px] gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {HERO_KPI_METRICS.map((metric) => (
          <HeroKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-x-[14px] gap-y-6 xl:grid-cols-[1.55fr_1fr]">
        <RecordableInjuriesChart />
        <RecordablesBySiteCard />
      </div>

      <div className="grid gap-x-3 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {GRID_INDICATORS.map((metric) => (
          <IndicatorCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-x-3 gap-y-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,3.3fr)]">
        {HAZARD_INDICATOR ? <IndicatorCard metric={HAZARD_INDICATOR} /> : null}
        <InjuryMixCard />
      </div>

      <Text as="p" className="text-ehs-muted-text text-sm leading-4">
        {INCIDENT_KPIS_FOOTNOTE}
      </Text>
    </div>
  );
}
