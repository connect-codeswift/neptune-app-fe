"use client";

import { useMemo } from "react";
import { Text } from "@/components/Text";
import { CreatableMultiSelectInput } from "@/components/inputs/CreatableMultiSelectInput";
import { FIELD_TEXTAREA_CLASS } from "@/components/ui/field-styles";
import type { SelectOption } from "@/components/inputs/SelectInput";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";
import { useRcaCategoriesQuery } from "@/hooks/use-rca-queries";
import { useCreateRcaCategoryMutation } from "@/hooks/use-rca-mutations";
import { toast } from "@/lib/toast";

export type IncidentClosureStepRootCauseProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
}>;

const ALL_CONTRIBUTING_FACTORS = [
  "Procedure Gap",
  "Maintenance Schedules",
  "Training Deficiency",
  "Equipment Age",
  "Tool Availability",
  "Inspection Frequency",
  "Communication Barrier",
] as const;

function buildContributingFactorOptions(
  selected: readonly string[],
): SelectOption[] {
  const known = new Set<string>(ALL_CONTRIBUTING_FACTORS);
  const extras = selected.filter((factor) => !known.has(factor));

  return [
    ...ALL_CONTRIBUTING_FACTORS.map((factor) => ({
      value: factor,
      label: factor,
    })),
    ...extras.map((factor) => ({ value: factor, label: factor })),
  ];
}

export function IncidentClosureStepRootCause(
  props: Readonly<IncidentClosureStepRootCauseProps>,
) {
  const { data, onChangeField } = props;

  const rcaCategoriesQuery = useRcaCategoriesQuery();
  const createRcaCategoryMutation = useCreateRcaCategoryMutation();

  const rcaCategoryOptions: SelectOption[] = (
    rcaCategoriesQuery.data?.all ?? []
  ).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const selectedRootCauseCategoryIds = data.primaryRootCauseCategoryIds ?? [];
  const selectedContributingFactors = useMemo(
    () => data.contributingFactors ?? [],
    [data.contributingFactors],
  );

  const contributingFactorOptions = useMemo(
    () => buildContributingFactorOptions(selectedContributingFactors),
    [selectedContributingFactors],
  );

  const handleCreateRcaCategory = async (name: string) => {
    try {
      const created = await createRcaCategoryMutation.mutateAsync(name);
      if (created) {
        const newId = String(created.id);
        if (!selectedRootCauseCategoryIds.includes(newId)) {
          onChangeField("primaryRootCauseCategoryIds", [
            ...selectedRootCauseCategoryIds,
            newId,
          ]);
        }
      }
    } catch {
      toast.error("Failed to add category", "Please try again.");
      throw new Error("Failed to add RCA category");
    }
  };

  const handleCreateContributingFactor = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || selectedContributingFactors.includes(trimmed)) {
      return;
    }
    onChangeField("contributingFactors", [
      ...selectedContributingFactors,
      trimmed,
    ]);
  };

  return (
    <div className="flex flex-col gap-5">
      <Text as="h2" className="text5 text-ehs-dark-bg leading-normal font-bold">
        Root Cause Summary
      </Text>

      {/* Primary Root Cause */}
      <div className="flex flex-col">
        <label className="text8 text-ehs-muted-text mb-2 font-bold tracking-[0.5px] uppercase">
          PRIMARY ROOT CAUSE
        </label>
        <CreatableMultiSelectInput
          placeholder="Select root cause categories..."
          options={rcaCategoryOptions}
          value={selectedRootCauseCategoryIds}
          onChange={(next) =>
            onChangeField("primaryRootCauseCategoryIds", next)
          }
          onCreate={handleCreateRcaCategory}
          isCreating={createRcaCategoryMutation.isPending}
          createLabel="Add new category"
          createPlaceholder="Enter category name…"
          disabled={rcaCategoriesQuery.isLoading}
        />
      </div>

      {/* Contributing Factors */}
      <div className="flex flex-col">
        <label className="text8 text-ehs-muted-text mb-2 font-bold tracking-[0.5px] uppercase">
          CONTRIBUTING FACTORS
        </label>
        <CreatableMultiSelectInput
          placeholder="Select contributing factors..."
          options={contributingFactorOptions}
          value={selectedContributingFactors}
          onChange={(next) => onChangeField("contributingFactors", next)}
          onCreate={handleCreateContributingFactor}
          createLabel="Add new factor"
          createPlaceholder="Enter factor name…"
        />
      </div>

      {/* Root Cause Description */}
      <div className="flex flex-col">
        <label className="text8 text-ehs-muted-text mb-2 font-bold tracking-[0.5px] uppercase">
          ROOT CAUSE DESCRIPTION
        </label>
        <textarea
          value={data.rootCauseSummary}
          onChange={(e) => onChangeField("rootCauseSummary", e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe the root cause details..."
          className={FIELD_TEXTAREA_CLASS}
        />
        <span className="text8 text-ehs-muted-text mt-1.5 self-end font-normal">
          {`${String(data.rootCauseSummary.length)} / 1000 min`}
        </span>
      </div>
    </div>
  );
}
