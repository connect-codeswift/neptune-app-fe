import Link from "next/link";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type {
  NearMissRecord,
  NearMissStatus,
} from "@/app/dashboard/near-miss/near-miss-data";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";

const sectionHeadingClass = "text-ehs-dark-bg text-lg font-semibold";

const statusTone: Record<NearMissStatus, IncidentBadgeTone> = {
  Open: "neutral",
  Investigating: "warn",
  Closed: "muted",
};

function DetailField(
  props: Readonly<{ label: string; children: React.ReactNode }>,
) {
  const { label, children } = props;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Text as="p" className="text-ehs-muted-text text-sm font-normal">
        {label}
      </Text>
      {children}
    </div>
  );
}

function DetailValue(props: Readonly<{ value: string }>) {
  return (
    <Text as="p" className="text-ehs-dark-bg font-normal">
      {props.value}
    </Text>
  );
}

export function NearMissDetailView(
  props: Readonly<{ record: NearMissRecord }>,
) {
  const { record } = props;

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,772fr)_minmax(0,354fr)]">
      {/* Left column: narrative sections */}
      <div className="flex min-w-0 flex-col gap-5">
        <IncidentGlassCard incidentGlassCardClassName="gap-2">
          <Text as="h3" className={sectionHeadingClass}>
            Event Description
          </Text>
          <Text as="p" className="font-normal">
            {record.description}
          </Text>
        </IncidentGlassCard>

        <IncidentGlassCard incidentGlassCardClassName="gap-2">
          <Text as="h3" className={sectionHeadingClass}>
            Contributing Factors
          </Text>
          {record.contributingFactors.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {record.contributingFactors.map((factor) => (
                <span
                  key={factor}
                  className="bg-ehs-dark-bg/12 inline-flex items-center rounded-full px-6 py-1 text-sm font-normal"
                >
                  {factor}
                </span>
              ))}
            </div>
          ) : (
            <Text as="p" className="text-ehs-muted-text text-xs">
              No contributing factors recorded.
            </Text>
          )}
        </IncidentGlassCard>

        <IncidentGlassCard incidentGlassCardClassName="gap-2">
          <Text as="h3" className={sectionHeadingClass}>
            What Could Have Happened?
          </Text>
          <div className="bg-ehs-dark-bg/12 border-ehs-dark-bg/12 rounded-lg border p-4">
            {/* Plain <p>: mixed weights, so `Text` (single string child) doesn't fit */}
            <p className="text-ehs-dark-bg font-inter leading-5 font-normal">
              If the near-miss had escalated, this could have resulted in a{" "}
              injury or incident. Immediate corrective action is required to
              prevent recurrence.
            </p>
          </div>
        </IncidentGlassCard>
      </div>

      {/* Right column: details + related CAPAs */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-2">
          <Text as="h3" className={sectionHeadingClass}>
            Details
          </Text>
          <div className="flex flex-col gap-3">
            <DetailField label="Date">
              <DetailValue value={record.dateOfEvent} />
            </DetailField>
            <DetailField label="Location">
              <DetailValue value={record.location} />
            </DetailField>
            <DetailField label="Reporter">
              <DetailValue value={record.reporter} />
            </DetailField>
            <DetailField label="Status">
              <IncidentBadge
                label={record.status}
                tone={statusTone[record.status]}
                showDot
                className="text-ehs-dark-bg w-fit px-2.5 py-0.5 text-sm! font-normal!"
              />
            </DetailField>
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard incidentGlassCardClassName="gap-2">
          <div className="flex items-center justify-between gap-3">
            <Text as="h3" className={sectionHeadingClass}>
              Related CAPAs
            </Text>
            <Link
              href="/dashboard/capa"
              className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover font-normal transition-colors"
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
                  className="flex flex-col gap-0.5 rounded-lg bg-[rgba(238,241,246,0.7)] p-2.5 transition-colors hover:bg-[rgba(238,241,246,0.95)]"
                >
                  <Text as="span" className="text-ehs-normal-blue text-sm">
                    {capa.id}
                  </Text>
                  <Text as="span" className="text-ehs-darker text-sm">
                    {capa.title}
                  </Text>
                </Link>
              ))}
            </div>
          ) : (
            <Text as="p" className="text-ehs-muted-text text-xs">
              No CAPAs linked to this near miss yet.
            </Text>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
