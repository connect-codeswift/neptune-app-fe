"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { CreatableMultiSelectInput } from "@/components/inputs/CreatableMultiSelectInput";
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
];

export function IncidentClosureStepRootCause(
  props: Readonly<IncidentClosureStepRootCauseProps>,
) {
  const { data, onChangeField } = props;
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const rcaCategoriesQuery = useRcaCategoriesQuery();
  const createRcaCategoryMutation = useCreateRcaCategoryMutation();

  const rcaCategoryOptions: SelectOption[] = (
    rcaCategoriesQuery.data ?? []
  ).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const selectedRootCauseCategoryIds = data.primaryRootCauseCategoryIds ?? [];

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

  const currentFactors = data.contributingFactors ?? [];

  const handleRemoveFactor = (factorToRemove: string) => {
    const updated = currentFactors.filter((f) => f !== factorToRemove);
    onChangeField("contributingFactors", updated);
  };

  const handleAddFactor = (factorToAdd: string) => {
    if (!currentFactors.includes(factorToAdd)) {
      onChangeField("contributingFactors", [...currentFactors, factorToAdd]);
    }
    setIsAddMenuOpen(false);
  };

  const availableFactors = ALL_CONTRIBUTING_FACTORS.filter(
    (f) => !currentFactors.includes(f),
  );

  return (
    <div className="flex flex-col gap-5">
      <Text
        as="h2"
        className="text-[15px] leading-normal font-bold text-ehs-dark-bg"
      >
        Root Cause Summary
      </Text>

      {/* Primary Root Cause */}
      <div className="flex flex-col">
        <label className="mb-2 text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
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
        <label className="mb-2 text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
          CONTRIBUTING FACTORS
        </label>
        <div className="relative flex min-h-[46px] flex-wrap items-center gap-2 rounded-[14px] border border-ehs-border bg-white p-2.5 shadow-xs">
          {currentFactors.map((factor) => (
            <span
              key={factor}
              className="inline-flex items-center gap-1.5 rounded-full bg-ehs-light-blue px-3 py-1 text-[13px] font-semibold text-ehs-normal-blue"
            >
              <span>{factor}</span>
              <button
                type="button"
                onClick={() => handleRemoveFactor(factor)}
                className="inline-flex size-4 items-center justify-center rounded-full text-ehs-normal-blue transition-colors hover:bg-ehs-normal-blue/20 hover:text-ehs-dark-blue-active"
                aria-label={`Remove ${factor}`}
              >
                <Icon icon="mdi:close-circle" className="size-3.5" />
              </button>
            </span>
          ))}

          {availableFactors.length > 0 ? (
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-ehs-normal-blue/40 bg-white px-2.5 py-1 text-[13px] font-bold text-ehs-normal-blue transition-colors hover:bg-ehs-light-blue/40"
              >
                <Icon icon="mdi:plus" className="size-3.5" />
                <span>Add Factor</span>
              </button>

              {isAddMenuOpen ? (
                <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-[14px] border border-ehs-border bg-white p-1.5 shadow-lg">
                  {availableFactors.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleAddFactor(f)}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-[13px] font-normal text-ehs-dark-bg hover:bg-ehs-light-blue/40 hover:text-ehs-normal-blue"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Root Cause Description */}
      <div className="flex flex-col">
        <label className="mb-2 text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
          ROOT CAUSE DESCRIPTION
        </label>
        <textarea
          value={data.rootCauseSummary}
          onChange={(e) => onChangeField("rootCauseSummary", e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe the root cause details..."
          className="w-full resize-y rounded-[14px] border border-ehs-border bg-white px-3.5 py-3 text-[13px] leading-[20px] font-normal text-ehs-dark-bg shadow-xs transition outline-none focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20"
        />
        <span className="mt-1.5 self-end text-[11px] font-normal text-ehs-muted-text">
          {`${String(data.rootCauseSummary.length)} / 1000 min`}
        </span>
      </div>
    </div>
  );
}
