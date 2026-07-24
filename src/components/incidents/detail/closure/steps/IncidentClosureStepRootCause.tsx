"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepRootCauseProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K]
  ) => void;
}>;

const PRIMARY_ROOT_CAUSE_OPTIONS = [
  "Equipment Failure",
  "Human Error",
  "Procedural Defect",
  "Design Flaw",
  "Environmental Factor",
  "Material Defect",
];

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
  props: Readonly<IncidentClosureStepRootCauseProps>
) {
  const { data, onChangeField } = props;
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

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
    (f) => !currentFactors.includes(f)
  );

  return (
    <div className="flex flex-col gap-5">
      <Text
        as="h2"
        className="text-[18px] leading-tight font-bold tracking-tight text-[#0f172a]"
      >
        Root Cause Summary
      </Text>

      {/* Primary Root Cause */}
      <div className="flex flex-col">
        <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          PRIMARY ROOT CAUSE
        </label>
        <div className="relative">
          <select
            value={data.primaryRootCause}
            onChange={(e) => onChangeField("primaryRootCause", e.target.value)}
            className="w-full appearance-none rounded-[14px] border border-[#e2e8f0] bg-white py-2.5 pr-9 pl-3.5 text-[13px] font-semibold text-[#0f172a] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
          >
            {PRIMARY_ROOT_CAUSE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Icon
            icon="mdi:chevron-down"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-[#64748b]"
          />
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="flex flex-col">
        <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          CONTRIBUTING FACTORS
        </label>
        <div className="relative flex min-h-[46px] flex-wrap items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-white p-2.5 shadow-xs">
          {currentFactors.map((factor) => (
            <span
              key={factor}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#d2eff4] px-3 py-1 text-[12px] font-semibold text-[#008ba3]"
            >
              <span>{factor}</span>
              <button
                type="button"
                onClick={() => handleRemoveFactor(factor)}
                className="inline-flex size-4 items-center justify-center rounded-full text-[#008ba3] transition-colors hover:bg-[#008ba3]/20 hover:text-[#005f70]"
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
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#008ba3]/40 bg-white px-2.5 py-1 text-[11px] font-bold text-[#008ba3] transition-colors hover:bg-[#d2eff4]/40"
              >
                <Icon icon="mdi:plus" className="size-3.5" />
                <span>Add Factor</span>
              </button>

              {isAddMenuOpen ? (
                <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-[14px] border border-[#e2e8f0] bg-white p-1.5 shadow-lg">
                  {availableFactors.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleAddFactor(f)}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-[12px] font-semibold text-[#1e293b] hover:bg-[#d2eff4]/40 hover:text-[#008ba3]"
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
        <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          ROOT CAUSE DESCRIPTION
        </label>
        <textarea
          value={data.rootCauseSummary}
          onChange={(e) => onChangeField("rootCauseSummary", e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe the root cause details..."
          className="w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-white px-3.5 py-3 text-[13px] font-medium leading-[20px] text-[#1e293b] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
        />
        <span className="mt-1.5 self-end text-[11px] font-semibold text-[#94a3b8]">
          {`${String(data.rootCauseSummary.length)} / 1000 min`}
        </span>
      </div>
    </div>
  );
}
