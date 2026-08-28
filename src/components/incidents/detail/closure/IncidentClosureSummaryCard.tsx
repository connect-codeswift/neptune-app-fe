"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentClosureMetadataCard } from "@/components/incidents/detail/closure/IncidentClosureMetadataCard";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureSummaryCardProps = Readonly<{
  data: IncidentClosureData;
}>;

/** Renders "Not recorded" rather than an empty gap, so a blank field reads as a
 *  fact about the record instead of looking like the page failed to load. */
function SummaryRow(
  props: Readonly<{ label: string; value: string | null | undefined }>,
) {
  const { label, value } = props;
  const shown = value != null && value.trim() !== "" ? value : "Not recorded";

  return (
    <div className="flex items-start justify-between gap-4">
      <Text
        as="span"
        className="text8 text-ehs-muted-text shrink-0 font-normal"
      >
        {label}
      </Text>
      <Text
        as="span"
        className="text8 text-ehs-dark-bg text-right font-semibold"
      >
        {shown}
      </Text>
    </div>
  );
}

function SummarySection(
  props: Readonly<{ title: string; children: React.ReactNode }>,
) {
  const { title, children } = props;

  return (
    <div className="flex flex-col gap-3">
      <Text
        as="h3"
        className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase"
      >
        {title}
      </Text>
      {children}
    </div>
  );
}

/**
 * The read-only face of a finalised closure.
 *
 * <p>Closing an incident used to make its own closure record unreachable: the closure
 * tab was disabled outright to stop a second submission, which also hid the
 * classification, root cause, CAPAs and signature that closing had just captured. The
 * tab stays reachable now and renders this instead of the wizard, so the record can be
 * read back without offering any control that would write to it.</p>
 */
export function IncidentClosureSummaryCard(
  props: Readonly<IncidentClosureSummaryCardProps>,
) {
  const { data } = props;

  const contributingFactors = data.contributingFactors.filter(
    (factor) => factor.trim() !== "",
  );

  return (
    <div className="mt-4.5 flex flex-col gap-4.5 lg:flex-row lg:items-start">
      <IncidentGlassCard
        paddingClassName="p-5.5"
        incidentGlassCardClassName="gap-6"
        className="min-w-0 flex-1"
      >
        <div className="flex items-center justify-between gap-3">
          <Text
            as="h2"
            className="text-ehs-dark-bg text5 leading-normal font-bold"
          >
            Closure Summary
          </Text>
          <span className="text8 bg-ehs-light-blue/60 text-ehs-normal-blue inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold">
            <Icon icon="mdi:lock-check-outline" className="size-3.5" />
            Closed
          </span>
        </div>

        <SummarySection title="Closure Classification">
          <SummaryRow
            label="Final incident type"
            value={data.finalIncidentType}
          />
          <SummaryRow
            label="SIF classification"
            value={data.sifClassification}
          />
          <SummaryRow
            label="OSHA recordable"
            value={data.isOshaRecordable ? "Yes" : "No"}
          />
          <SummaryRow
            label="Days away from work"
            value={String(data.daysAwayFromWork)}
          />
          <SummaryRow
            label="Days on restricted duty"
            value={String(data.daysOnRestrictedDuty)}
          />
        </SummarySection>

        <SummarySection title="Root Cause">
          <Text
            as="p"
            className="text-ehs-dark-bg text4 leading-5 font-normal whitespace-pre-line"
          >
            {data.rootCauseSummary.trim() !== ""
              ? data.rootCauseSummary
              : "No root cause description was recorded."}
          </Text>
          {contributingFactors.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {contributingFactors.map((factor) => (
                <span
                  key={factor}
                  className="text8 bg-ehs-surface-inverse/8 text-ehs-gray rounded-full px-2.5 py-0.5 font-semibold"
                >
                  {factor}
                </span>
              ))}
            </div>
          ) : null}
        </SummarySection>

        <SummarySection title="Preventive Measures">
          {data.closureLinkedCapas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.closureLinkedCapas.map((capa) => (
                <div
                  key={capa.id}
                  className="rounded-3.5 border-ehs-border bg-ehs-surface flex items-center justify-between gap-3 border px-4 py-3"
                >
                  <Text
                    as="span"
                    className="text-ehs-dark-bg text4 min-w-0 font-bold"
                  >
                    {capa.title}
                  </Text>
                  <span className="text8 text-ehs-gray bg-ehs-surface-inverse/8 shrink-0 rounded-full px-2.5 py-0.5 font-bold">
                    {capa.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Text as="p" className="text-ehs-muted-text text4 font-normal">
              No CAPAs were linked to this incident.
            </Text>
          )}
        </SummarySection>

        {data.actionsTaken.trim() !== "" ? (
          <SummarySection title="Notes">
            <Text
              as="p"
              className="text-ehs-dark-bg text4 leading-5 font-normal whitespace-pre-line"
            >
              {data.actionsTaken}
            </Text>
          </SummarySection>
        ) : null}
      </IncidentGlassCard>

      <div className="w-full shrink-0 lg:w-75">
        <IncidentClosureMetadataCard data={data} />
      </div>
    </div>
  );
}
