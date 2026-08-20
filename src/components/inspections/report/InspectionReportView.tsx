import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type { InspectionReport } from "@/app/dashboard/inspections/report/inspection-report-data";

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

export type InspectionReportViewProps = Readonly<{ report: InspectionReport }>;

export function InspectionReportView(props: InspectionReportViewProps) {
  const { report } = props;

  return (
    <div className="mx-auto flex w-full max-w-200 min-w-0 flex-col gap-3.5">
      <IncidentGlassCard
        paddingClassName="p-5 sm:p-6"
        className="backdrop-blur-2.5 bg-ehs-surface/62"
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
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="Inspector" value={report.inspector} />
          <MetaField label="Date" value={report.date} />
          <MetaField label="Status" value={report.status} />
        </div>

        <div className="bg-ehs-form-classes-bg/70 flex flex-col gap-2 rounded-xl p-4">
          <Text as="h3" className="text8 text-ehs-muted-text font-semibold">
            Executive Summary
          </Text>
          <Text as="p" className="text4 text-ehs-darker">
            {report.executiveSummary}
          </Text>
        </div>
      </IncidentGlassCard>
    </div>
  );
}
