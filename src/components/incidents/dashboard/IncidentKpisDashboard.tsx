import { Text } from "@/components/Text";
import { IncidentKpisHeroRow } from "@/components/incidents/dashboard/IncidentKpisHeroRow";
import { IncidentKpisDashboardSections } from "@/components/incidents/dashboard/IncidentKpisDashboardSections";
import { INCIDENT_KPIS_FOOTNOTE } from "@/components/incidents/dashboard/incident-kpis-data";

export type IncidentKpisDashboardProps = Readonly<{
  className?: string;
}>;

export function IncidentKpisDashboard(
  props: Readonly<IncidentKpisDashboardProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
    >
      <IncidentKpisHeroRow />
      <IncidentKpisDashboardSections />

      <Text as="p" className="text-ehs-muted-text text-sm leading-4">
        {INCIDENT_KPIS_FOOTNOTE}
      </Text>
    </div>
  );
}
