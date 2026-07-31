import { IncidentGlassCard } from "@/components/incidents";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { InspectionFinding } from "@/app/dashboard/inspections/findings/inspection-findings-data";

export type InspectionFindingCardProps = Readonly<{ finding: InspectionFinding }>;

export function InspectionFindingCard(props: InspectionFindingCardProps) {
  const { finding } = props;

  return (
    <IncidentGlassCard
      paddingClassName="px-5 py-4"
      className="min-w-0"
      incidentGlassCardClassName="gap-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IncidentBadge
            label={finding.severity}
            tone="muted"
            className="rounded-xl px-2 py-0.5 text-sm! font-semibold"
          />
          <span className="text-ehs-muted-text min-w-0 truncate text-sm">
            {finding.category}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <IncidentBadge
            label={finding.status}
            tone="muted"
            showDot
            className="rounded-full px-2.5 py-0.5 text-sm!"
          />

          {finding.capaCreated ? (
            <span className="bg-ehs-dark-bg/8 text-ehs-gray rounded-md px-2.5 py-0.5 text-sm whitespace-nowrap">
              CAPA Created
            </span>
          ) : null}
        </div>
      </div>

      <p className="text-ehs-darker">{finding.description}</p>
    </IncidentGlassCard>
  );
}
