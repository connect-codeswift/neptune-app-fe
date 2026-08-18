import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import { Text } from "@/components/Text";
import type { AuditFinding } from "@/app/dashboard/audits/findings/audit-findings-data";

export type AuditFindingCardProps = Readonly<{ finding: AuditFinding }>;

function severityTone(severity: string): IncidentBadgeTone {
  const normalized = severity.trim().toLowerCase();
  if (normalized === "critical" || normalized === "high") return "danger";
  if (normalized === "medium" || normalized === "moderate") return "warn";
  return "muted";
}

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status.trim().toLowerCase();
  if (normalized === "open") return "warn";
  if (normalized === "closed" || normalized === "resolved") return "teal";
  return "muted";
}

export function AuditFindingCard(props: AuditFindingCardProps) {
  const { finding } = props;

  return (
    <IncidentGlassCard
      paddingClassName="px-5 py-4"
      className="backdrop-blur-2.5 min-w-0 bg-[rgba(255,255,255,0.62)]"
      incidentGlassCardClassName="gap-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IncidentBadge
            label={finding.severity}
            tone={severityTone(finding.severity)}
            className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
          />
          <Text
            as="span"
            className="text8 text-ehs-muted-text min-w-0 truncate"
          >
            {finding.category}
          </Text>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <IncidentBadge
            label={finding.status}
            tone={statusTone(finding.status)}
            showDot
            className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
          />

          {finding.capaCreated ? (
            <Text
              as="span"
              className="bg-ehs-dark-bg/8 text5 text-ehs-gray rounded-md px-2.5 py-0.5 whitespace-nowrap"
            >
              CAPA Created
            </Text>
          ) : null}
        </div>
      </div>

      <Text as="p" className="text4 text-ehs-darker">
        {finding.description}
      </Text>
    </IncidentGlassCard>
  );
}
