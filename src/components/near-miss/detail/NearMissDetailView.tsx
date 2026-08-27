import Link from "next/link";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type {
  NearMissRecord,
  NearMissStatus,
} from "@/app/dashboard/near-miss/near-miss-data";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";

const CAPA_NEW_ROUTE = "/dashboard/capa/new";
const sectionHeadingClass = "text3 text-ehs-darker";

const statusTone: Record<NearMissStatus, IncidentBadgeTone> = {
  Open: "teal",
  Investigating: "warn",
  Closed: "muted",
};

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

export function NearMissDetailView(
  props: Readonly<{ record: NearMissRecord; onAddCapa?: () => void }>,
) {
  const { record, onAddCapa } = props;

  // The record id the API knows, dug out of the display id ("HZ-12" -> 12). Both records
  // carry their id already formatted for the header, and re-fetching just to recover the
  // number would be a request to learn something the string already says.
  const nearMissSourceId = Number(record.id.replace(/^\D+/, "")) || 0;

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,731fr)_minmax(0,405fr)]">
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-4">
          <Text as="h3" className={sectionHeadingClass}>
            Near Miss Details
          </Text>
          <DetailField label="What happened">
            <DetailValue value={record.description || "—"} />
          </DetailField>
          <DetailField label="Contributing Factors">
            {record.contributingFactors.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {record.contributingFactors.map((factor) => (
                  <Text
                    key={factor}
                    as="span"
                    className="text4 bg-ehs-surface-inverse/12 text-ehs-darker inline-flex items-center rounded-full px-3 py-1"
                  >
                    {factor}
                  </Text>
                ))}
              </div>
            ) : (
              <DetailValue value="—" />
            )}
          </DetailField>
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <DetailField label="Hazard Type">
              <DetailValue value={record.hazardType} />
            </DetailField>
            <DetailField label="Location">
              <DetailValue value={record.location} />
            </DetailField>
            <DetailField label="Status">
              <IncidentBadge
                label={record.status}
                tone={statusTone[record.status]}
                showDot
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
            </DetailField>
            <DetailField label="Date of Event">
              <DetailValue value={record.dateOfEvent} />
            </DetailField>
            <DetailField label="Reporter">
              <DetailValue value={record.reporter} />
            </DetailField>
          </div>
        </IncidentGlassCard>
      </div>

      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard incidentGlassCardClassName="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Text as="h3" className={sectionHeadingClass}>
              Related CAPAs
            </Text>
            {/* A modal, not a link to /capa/new: raising a CAPA from a near miss should not
                leave the near miss, which is how the incident module already works. The link
                is kept as the fallback for a container that has not wired the modal. */}
            {onAddCapa ? (
              <button
                type="button"
                onClick={onAddCapa}
                className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover cursor-pointer transition-colors"
              >
                Add CAPA
              </button>
            ) : (
              <Link
                href={`${CAPA_NEW_ROUTE}?sourceType=NearMiss&sourceId=${String(nearMissSourceId)}`}
                className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover transition-colors"
              >
                Add CAPA
              </Link>
            )}
          </div>

          {record.relatedCapas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {record.relatedCapas.map((capa) => (
                <Link
                  key={capa.id}
                  href="/dashboard/capa"
                  className="bg-ehs-form-classes-bg/70 hover:bg-ehs-form-classes-bg/95 flex flex-col gap-0.5 rounded-lg p-2.5 transition-colors"
                >
                  <Text as="span" className="text7 text-ehs-normal-blue">
                    {capa.id}
                  </Text>
                  <Text as="span" className="text4 text-ehs-darker">
                    {capa.title}
                  </Text>
                </Link>
              ))}
            </div>
          ) : (
            <Text as="p" className="text8 text-ehs-muted-text">
              No CAPAs linked to this near miss yet.
            </Text>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
