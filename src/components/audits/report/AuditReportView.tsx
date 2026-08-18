import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type { AuditReport } from "@/app/dashboard/audits/report/audit-report-data";

/** Scores at or above the template's pass mark are green, the rest red. */
function scoreColor(score: number, passThreshold: number): string {
  return score >= passThreshold ? "#10b981" : "#ef4444";
}

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="span" className="text6 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="span" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

export type AuditReportViewProps = Readonly<{ report: AuditReport }>;

export function AuditReportView(props: AuditReportViewProps) {
  const { report } = props;

  return (
    <div className="mx-auto flex w-full max-w-200 min-w-0 flex-col gap-3.5">
      <IncidentGlassCard
        paddingClassName="p-5 sm:p-6"
        className="backdrop-blur-2.5 bg-[rgba(255,255,255,0.62)]"
        incidentGlassCardClassName="gap-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="h2" className="text3 text-ehs-darker">
              {report.title}
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text">
              {report.scope}
            </Text>
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <Text
              as="span"
              className="text2 tabular-nums"
              style={{ color: scoreColor(report.score, report.passThreshold) }}
            >
              {`${String(report.score)}%`}
            </Text>
            <Text as="span" className="text8 text-ehs-muted-text">
              Audit Score
            </Text>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="Auditor" value={report.auditor} />
          <MetaField label="Date" value={report.date} />
          <MetaField label="Status" value={report.status} />
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-[rgba(238,241,246,0.7)] p-4">
          <Text as="h3" className="text8 text-ehs-muted-text font-semibold">
            Executive Summary
          </Text>
          <Text as="p" className="text4 text-ehs-darker">
            {report.executiveSummary}
          </Text>
        </div>
      </IncidentGlassCard>

      {report.sectionScores.length > 0 ? (
        <IncidentGlassCard
          paddingClassName="p-5 sm:p-6"
          className="backdrop-blur-2.5 bg-[rgba(255,255,255,0.62)]"
          incidentGlassCardClassName="gap-4"
        >
          <Text as="h3" className="text3 text-ehs-darker">
            Score by Section
          </Text>

          <ul className="flex flex-col gap-4">
            {report.sectionScores.map((entry) => {
              const color = scoreColor(entry.score, report.passThreshold);

              return (
                <li key={entry.section} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <Text
                      as="span"
                      className="text4 text-ehs-gray min-w-0 truncate"
                    >
                      {entry.section}
                    </Text>
                    <Text
                      as="span"
                      className="text4 shrink-0 tabular-nums"
                      style={{ color }}
                    >
                      {`${String(entry.score)}%`}
                    </Text>
                  </div>

                  <span
                    className="h-2.5 w-full overflow-hidden rounded-full bg-[#eef1f6]"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${String(entry.score)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </IncidentGlassCard>
      ) : null}
    </div>
  );
}
