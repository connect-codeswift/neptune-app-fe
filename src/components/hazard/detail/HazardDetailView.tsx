import Link from "next/link";
import { Text } from "@/components/Text";
import { PhotoEvidence } from "@/components/shared/PhotoEvidence";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

const sectionHeadingClass = "text3 text-ehs-darker";

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (normalized === "open") return "teal";
  if (normalized === "investigating") return "warn";
  if (normalized === "closed") return "muted";
  return "muted";
}

function DetailField(
  props: Readonly<{ label: string; children: React.ReactNode }>,
) {
  const { label, children } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      {children}
    </div>
  );
}

function DetailValue(props: Readonly<{ value: string }>) {
  return (
    <Text as="p" className="text4 text-ehs-darker">
      {props.value}
    </Text>
  );
}

export function HazardDetailView(
  props: Readonly<{ record: HazardRecord; onAddCapa?: () => void }>,
) {
  const { record, onAddCapa } = props;

  // The record id the API knows, dug out of the display id ("HZ-12" -> 12). Both records
  // carry their id already formatted for the header, and re-fetching just to recover the
  // number would be a request to learn something the string already says.
  const hazardSourceId = Number(record.id.replace(/^\D+/, "")) || 0;

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,731fr)_minmax(0,405fr)]">
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-4">
          <Text as="h3" className={sectionHeadingClass}>
            Hazard Details
          </Text>
          <DetailField label="Description">
            <DetailValue value={record.description || "—"} />
          </DetailField>
          {record.attachments.length > 0 ? (
            <DetailField label="Attachments">
              <PhotoEvidence refs={record.attachments} />
            </DetailField>
          ) : null}
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <DetailField label="Type">
              <DetailValue value={record.hazardType} />
            </DetailField>
            <DetailField label="Location">
              <DetailValue value={record.location} />
            </DetailField>
            <DetailField label="Status">
              <IncidentBadge
                label={record.status}
                tone={statusTone(record.status)}
                showDot
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
            </DetailField>
            <DetailField label="Date Reported">
              <DetailValue value={record.dateReported} />
            </DetailField>
            <DetailField label="Reporter">
              <DetailValue value={record.reporter} />
            </DetailField>
            {record.status === "Closed" ? (
              <DetailField label="Closed by">
                <DetailValue
                  value={
                    record.closedAt
                      ? `${record.closedBy ?? "—"} · ${record.closedAt}`
                      : (record.closedBy ?? "—")
                  }
                />
              </DetailField>
            ) : null}
          </div>
        </IncidentGlassCard>
      </div>

      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Text as="h3" className={sectionHeadingClass}>
              Related CAPAs
            </Text>
            {/* A modal rather than a link to /capa/new, so raising a CAPA does not leave the
                hazard. Hidden once closed: the API refuses a CAPA against a closed record, and
                closing already requires every related CAPA to be closed. */}
            {onAddCapa && record.status !== "Closed" ? (
              <button
                type="button"
                onClick={onAddCapa}
                className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover cursor-pointer transition-colors"
              >
                Add CAPA
              </button>
            ) : null}
          </div>

          {record.relatedCapas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {record.relatedCapas.map((capa) => (
                <Link
                  key={capa.id}
                  href={`/dashboard/capa/${String(capa.numericId)}`}
                  className="bg-ehs-form-classes-bg/70 hover:bg-ehs-form-classes-bg/95 flex flex-col gap-1.5 rounded-lg p-2.5 transition-colors"
                >
                  <Text as="span" className="text7 text-ehs-normal-blue">
                    {capa.id}
                  </Text>
                  <Text as="span" className="text4 text-ehs-darker">
                    {capa.title}
                  </Text>
                  <IncidentBadge
                    label={capa.status}
                    tone={statusTone(capa.status)}
                    showDot
                    className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <Text as="p" className="text8 text-ehs-muted-text">
              No CAPAs linked to this hazard yet.
            </Text>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
