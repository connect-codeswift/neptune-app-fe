import Link from "next/link";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import { Text } from "@/components/Text";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AuditFinding } from "@/app/dashboard/audits/findings/audit-findings-data";

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

type FindingGroup = Readonly<{
  category: string;
  items: readonly AuditFinding[];
}>;

/** Groups findings by category, in first-seen order — mirrors a template's
 * sections, with each finding standing in for a section item. */
function groupByCategory(
  findings: readonly AuditFinding[],
): readonly FindingGroup[] {
  const order: string[] = [];
  const byCategory = new Map<string, AuditFinding[]>();

  findings.forEach((finding) => {
    const category = finding.category || "Uncategorized";
    const bucket = byCategory.get(category);
    if (bucket) {
      bucket.push(finding);
    } else {
      byCategory.set(category, [finding]);
      order.push(category);
    }
  });

  return order.map((category) => ({
    category,
    items: byCategory.get(category) ?? [],
  }));
}

export type AuditFindingsViewProps = Readonly<{
  findings: readonly AuditFinding[];
}>;

/** Findings grouped by category, styled like the template builder's
 * "Sections & Items" review — one card, grouped lists, bulleted rows. */
export function AuditFindingsView(props: AuditFindingsViewProps) {
  const { findings } = props;

  if (findings.length === 0) {
    return (
      <EmptyState
        icon="mdi:clipboard-check-outline"
        title="No findings raised"
        message="No findings were raised on this audit."
        action={
          <Link
            href="/dashboard/audits"
            className="text4 text-ehs-normal-blue hover:underline"
          >
            Back to Audits
          </Link>
        }
      />
    );
  }

  const groups = groupByCategory(findings);
  const criticalCount = findings.filter(
    (finding) => severityTone(finding.severity) === "danger",
  ).length;
  const openCount = findings.filter(
    (finding) => finding.status.trim().toLowerCase() === "open",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-200 min-w-0 flex-col gap-3.5">
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-4"
      >
        <Text as="h2" className="text3 text-ehs-darker">
          {`Findings (${String(findings.length)})`}
        </Text>

        <div className="flex gap-2.5">
          <div className="bg-ehs-red/8 flex flex-col items-center gap-0.5 rounded-xl px-6 py-3">
            <span className="text2 text-ehs-red">{String(criticalCount)}</span>
            <span className="text8 text-ehs-gray">Critical</span>
          </div>
          <div className="bg-ehs-yellow/10 flex flex-col items-center gap-0.5 rounded-xl px-6 py-3">
            <span className="text2 text-ehs-yellow">{String(openCount)}</span>
            <span className="text8 text-ehs-gray">Open</span>
          </div>
        </div>

        <ul className="divide-ehs-border-ink/10 flex flex-col divide-y">
          {groups.map((group) => (
            <li key={group.category} className="flex flex-col gap-2 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text4 text-ehs-gray min-w-0 truncate">
                  {group.category}
                </span>
                <span className="text8 text-ehs-muted-text shrink-0">
                  {`${String(group.items.length)} ${group.items.length === 1 ? "finding" : "findings"}`}
                </span>
              </div>

              <ul className="flex list-disc flex-col gap-2 pl-5">
                {group.items.map((finding) => (
                  <li
                    key={finding.id}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Text
                      as="span"
                      className="text4 text-ehs-darker min-w-0 flex-1"
                    >
                      {finding.title}
                    </Text>
                    <IncidentBadge
                      label={finding.severity}
                      tone={severityTone(finding.severity)}
                      className="text6 shrink-0 rounded-md px-2 py-0.5 tracking-normal"
                    />
                    <IncidentBadge
                      label={finding.status}
                      tone={statusTone(finding.status)}
                      showDot
                      className="text6 shrink-0 rounded-md px-2 py-0.5 tracking-normal"
                    />
                    {finding.isAutoRaised ? (
                      <span className="text6 text-ehs-muted-text shrink-0">
                        Auto-raised
                      </span>
                    ) : null}
                    {finding.dueDate ? (
                      <span className="text6 text-ehs-muted-text shrink-0">
                        {`Due ${finding.dueDate}`}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </IncidentGlassCard>
    </div>
  );
}
