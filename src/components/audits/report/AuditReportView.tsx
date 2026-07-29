import { IncidentGlassCard } from "@/components/incidents";
import type { AuditReport } from "@/app/dashboard/audits/report/audit-report-data";

/** Scores at or above the template's pass mark are green, the rest red. */
function scoreColor(score: number, passThreshold: number): string {
  return score >= passThreshold ? "#10b981" : "#ef4444";
}

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-ehs-muted-text">{label}</span>
      <span className="text-ehs-dark-bg">{value}</span>
    </div>
  );
}

export type AuditReportViewProps = Readonly<{ report: AuditReport }>;

export function AuditReportView(props: AuditReportViewProps) {
  const { report } = props;

  return (
    <div className="flex min-w-0 flex-col gap-3.5 xl:max-w-4xl">
      {/* Summary */}
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-ehs-dark-bg text-2xl font-bold">
              {report.title}
            </h2>
            <p className="text-ehs-gray">{report.scope}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: scoreColor(report.score, report.passThreshold) }}
            >
              {`${String(report.score)}%`}
            </span>
            <span className="text-ehs-muted-text text-sm">Audit Score</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="Auditor" value={report.auditor} />
          <MetaField label="Date" value={report.date} />
          <MetaField label="Status" value={report.status} />
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-[rgba(238,241,246,0.7)] p-4">
          <h3 className="text-ehs-dark-bg font-bold">Executive Summary</h3>
          <p className="text-ehs-darker text-lg leading-6">
            {report.executiveSummary}
          </p>
        </div>
      </IncidentGlassCard>

      {/* Per-section scores */}
      {report.sectionScores.length > 0 ? (
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-4"
        >
          <h3 className="text-ehs-dark-bg text-xl font-bold">
            Score by Section
          </h3>

          <ul className="flex flex-col gap-4">
            {report.sectionScores.map((entry) => {
              const color = scoreColor(entry.score, report.passThreshold);

              return (
                <li key={entry.section} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ehs-gray min-w-0 truncate text-lg">
                      {entry.section}
                    </span>
                    <span className="shrink-0 tabular-nums" style={{ color }}>
                      {`${String(entry.score)}%`}
                    </span>
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
