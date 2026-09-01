"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";
import type { ClosureStepId } from "@/components/incidents/detail/closure/IncidentClosureStepsSidebar";
import { ReportReviewDetailCard } from "@/components/incidents/report/steps/step-5/ReportReviewDetailCard";
import { useRcaCategoriesQuery } from "@/hooks/use-rca-queries";

export type IncidentClosureStepReviewProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  /** Jumps back to a step so a summarised answer can be corrected in place. */
  onGoToStep?: (step: ClosureStepId) => void;
}>;

export function IncidentClosureStepReview(
  props: Readonly<IncidentClosureStepReviewProps>,
) {
  const { data, onChangeField, onGoToStep } = props;

  const isConfirmed = data.isEhsConfirmed ?? false;

  // The wizard stores root-cause category ids; resolve them to the names the
  // root-cause step shows so the review reads as a human summary, not a dump
  // of ids.
  const rcaCategoriesQuery = useRcaCategoriesQuery();
  const rcaCategoryNames = new Map(
    (rcaCategoriesQuery.data?.all ?? []).map((category) => [
      String(category.id),
      category.name,
    ]),
  );
  const rootCauseCategoriesLabel =
    data.primaryRootCauseCategoryIds.length > 0
      ? data.primaryRootCauseCategoryIds
          .map((id) => rcaCategoryNames.get(String(id)) ?? id)
          .join(", ")
      : "—";

  const finalIncidentType =
    !data.finalIncidentType || data.finalIncidentType === "Select option"
      ? "—"
      : data.finalIncidentType;
  const sifClassification =
    !data.sifClassification || data.sifClassification === "Select option"
      ? "—"
      : data.sifClassification;
  const recordableLabel = data.isOshaRecordable ? "Yes" : "No";
  const daysAwayLabel =
    data.finalIncidentType === "Lost Time"
      ? String(data.daysAwayFromWork)
      : "—";
  const daysRestrictedLabel =
    data.finalIncidentType === "Restricted Work"
      ? String(data.daysOnRestrictedDuty)
      : "—";
  const rootCauseSummary =
    data.rootCauseSummary.trim() || "No root cause description recorded.";
  const contributingFactorsLabel =
    data.contributingFactors.length > 0
      ? data.contributingFactors.join(", ")
      : "—";
  const actionsTaken = data.actionsTaken.trim() || "No closing notes recorded.";
  const capasLabel =
    data.closureLinkedCapas.length > 0
      ? data.closureLinkedCapas
          .map((capa) => capa.subtitle.trim() || capa.title)
          .join(", ")
      : "None";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          as="h2"
          className="text-ehs-dark-bg text5 leading-normal font-bold"
        >
          Digital Sign-off & Submission
        </Text>
        <Text as="p" className="text-ehs-gray text4 mt-2 leading-5 font-normal">
          Review the closure details below, then verify your credentials to
          finalize the legal compliance record.
        </Text>
      </div>

      {/* Closure summary — every row maps to the step that defines it, so the
          edit button on a card always lands on the right step. */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ReportReviewDetailCard
          title="Classification"
          onEdit={onGoToStep ? () => onGoToStep(1) : undefined}
          rows={[
            { label: "Final type", value: finalIncidentType },
            { label: "SIF", value: sifClassification },
            { label: "OSHA recordable", value: recordableLabel },
            { label: "Days away", value: daysAwayLabel },
            { label: "Restricted days", value: daysRestrictedLabel },
          ]}
        />

        <ReportReviewDetailCard
          title="Root cause"
          onEdit={onGoToStep ? () => onGoToStep(2) : undefined}
          rows={[
            { label: "Category", value: rootCauseCategoriesLabel },
            { label: "Contributing factors", value: contributingFactorsLabel },
            { label: "Description", value: rootCauseSummary },
          ]}
        />

        <ReportReviewDetailCard
          title="Preventive measures"
          onEdit={onGoToStep ? () => onGoToStep(3) : undefined}
          rows={[
            { label: "Linked CAPAs", value: capasLabel },
            { label: "Notes", value: actionsTaken },
          ]}
        />
      </div>

      {/* Sign-off Green/Teal Box. Never substitutes a placeholder identity:
          the copy above calls this a legal compliance record, so an invented
          signer name, role or timestamp would be indistinguishable from a real
          signature. Missing values read as "Not recorded". */}
      <div className="rounded-3.5 border-ehs-normal-blue/40 bg-ehs-light-blue/40 border p-4 shadow-xs">
        <Text as="p" className="text-ehs-dark-bg text4 font-bold">
          {data.closedBy || "Not recorded"}
        </Text>
        <Text as="p" className="text-ehs-gray text4 mt-0.5 font-normal">
          {[data.closedByRole, data.closureDate].filter(Boolean).join(" · ") ||
            "Role and date not recorded"}
        </Text>
      </div>

      {/* Confirmation Checkbox */}
      <button
        type="button"
        onClick={() => onChangeField("isEhsConfirmed", !isConfirmed)}
        className="flex items-center gap-3 text-left focus:outline-none"
      >
        <div
          className={[
            "flex size-5 shrink-0 items-center justify-center rounded transition-colors",
            isConfirmed
              ? "bg-ehs-normal-blue text-ehs-on-accent"
              : "border-ehs-border bg-ehs-surface border",
          ].join(" ")}
        >
          {isConfirmed ? (
            <Icon icon="mdi:check" className="size-4 stroke-3" />
          ) : null}
        </div>
        <Text as="span" className="text-ehs-dark-bg text4 font-bold">
          I confirm all corrective actions are complete and verified per EHS
          guidelines.
        </Text>
      </button>
    </div>
  );
}
