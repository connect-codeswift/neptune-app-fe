import Link from "next/link";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { HazardWorkflow } from "./HazardWorkflow";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

const sectionHeadingClass = "text-ehs-dark-bg text-lg font-semibold";

function DetailField(
  props: Readonly<{ label: string; children: React.ReactNode }>,
) {
  const { label, children } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text-ehs-muted-text text-sm font-normal">
        {label}
      </Text>
      {children}
    </div>
  );
}

function DetailValue(props: Readonly<{ value: string }>) {
  return (
    <Text as="p" className="text-ehs-dark-bg">
      {props.value}
    </Text>
  );
}

export function HazardDetailView(props: Readonly<{ record: HazardRecord }>) {
  const { record } = props;

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,731fr)_minmax(0,405fr)]">
      {/* Left column: workflow, narrative, structured details */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <HazardWorkflow stage={record.stage} />

        <IncidentGlassCard incidentGlassCardClassName="gap-3">
          <Text as="h3" className={sectionHeadingClass}>
            Description
          </Text>
          <Text as="p" className="text-ehs-darker font-normal">
            {record.description}
          </Text>
        </IncidentGlassCard>

        <IncidentGlassCard incidentGlassCardClassName="gap-4">
          <Text as="h3" className={sectionHeadingClass}>
            Hazard Details
          </Text>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <DetailField label="Type">
              <DetailValue value={record.hazardType} />
            </DetailField>
            <DetailField label="Category">
              <DetailValue value={record.category} />
            </DetailField>
            {/* <DetailField label="Risk Rating">
              <IncidentBadge
                label={record.severity}
                tone="neutral"
                className="w-fit rounded-md px-2 py-0.5 text-sm! tracking-[0.11px]"
              />
            </DetailField> */}
            <DetailField label="Status">
              <IncidentBadge
                label={record.stage}
                tone="muted"
                showDot
                className="w-fit px-2.5 py-0.5 text-sm! tracking-[0.11px]"
              />
            </DetailField>
            <DetailField label="Date Reported">
              <DetailValue value={record.dateReported} />
            </DetailField>
            <DetailField label="Reporter">
              <DetailValue value={record.reporter} />
            </DetailField>
            <DetailField label="Assigned To">
              <DetailValue value={record.assignedTo} />
            </DetailField>
            <DetailField label="Location">
              <DetailValue value={record.location} />
            </DetailField>
          </div>
        </IncidentGlassCard>
      </div>

      {/* Right column: related CAPAs */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Text as="h3" className={sectionHeadingClass}>
              Related CAPAs
            </Text>
            <Link
              href="/dashboard/capa"
              className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm font-normal transition-colors"
            >
              + Add
            </Link>
          </div>

          {record.relatedCapas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {record.relatedCapas.map((capa) => (
                <Link
                  key={capa.id}
                  href="/dashboard/capa"
                  className="flex flex-col gap-1.5 rounded-lg bg-[rgba(238,241,246,0.7)] p-2.5 transition-colors hover:bg-[rgba(238,241,246,0.95)]"
                >
                  <Text as="span" className="text-ehs-normal-blue text-sm">
                    {capa.id}
                  </Text>
                  <Text as="span" className="text-ehs-darker text-sm">
                    {capa.title}
                  </Text>
                  <IncidentBadge
                    label={capa.status}
                    tone="muted"
                    showDot
                    className="w-fit px-2.5 py-0.5 text-sm! tracking-[0.11px]"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <Text as="p" className="text-ehs-muted-text text-xs">
              No CAPAs linked to this hazard yet.
            </Text>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
