"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentClosureStepsSidebar,
  type ClosureStepId,
} from "@/components/incidents/detail/closure/IncidentClosureStepsSidebar";
import { IncidentClosureMetadataCard } from "@/components/incidents/detail/closure/IncidentClosureMetadataCard";
import { IncidentClosureStepClassification } from "@/components/incidents/detail/closure/steps/IncidentClosureStepClassification";
import { IncidentClosureStepRootCause } from "@/components/incidents/detail/closure/steps/IncidentClosureStepRootCause";
import { IncidentClosureStepPreventive } from "@/components/incidents/detail/closure/steps/IncidentClosureStepPreventive";
import { IncidentClosureStepReview } from "@/components/incidents/detail/closure/steps/IncidentClosureStepReview";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentDetailClosureCardProps = Readonly<{
  data: IncidentClosureData;
  onSelectStep: (step: ClosureStepId) => void;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleCheckItem: (itemId: string) => void;
  onSaveAsDraft?: () => void;
  onFinalizeClosure?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}>;

const STEP_NEXT_LABELS: Record<ClosureStepId, string> = {
  1: "Proceed to Root Cause",
  2: "Proceed to Preventive Measures",
  3: "Proceed to Review & Sign-off",
  4: "Close Incident",
};

const STEP_BACK_LABELS: Record<2 | 3 | 4, string> = {
  2: "Back to Classification",
  3: "Back to Root Cause",
  4: "Back to Preventive Measures",
};

export function IncidentDetailClosureCard(
  props: Readonly<IncidentDetailClosureCardProps>,
) {
  const {
    data,
    onSelectStep,
    onChangeField,
    onToggleCheckItem,
    onSaveAsDraft,
    onFinalizeClosure,
    onCancel,
    isSubmitting = false,
  } = props;

  const currentStep = data.currentStep;

  const handleProceedNext = () => {
    if (currentStep < 4) {
      onSelectStep((currentStep + 1) as ClosureStepId);
    } else {
      onFinalizeClosure?.();
    }
  };

  const handleBackPrevious = () => {
    if (currentStep > 1) {
      onSelectStep((currentStep - 1) as ClosureStepId);
    }
  };

  const showMetadata = currentStep === 1;

  return (
    <div
      className={[
        "mt-4 grid grid-cols-1 items-start gap-5",
        showMetadata
          ? "xl:grid-cols-[240px_minmax(0,1fr)_260px]"
          : "xl:grid-cols-[240px_minmax(0,1fr)]",
      ].join(" ")}
    >
      {/* Left Column: Steps Navigation Sidebar */}
      <IncidentClosureStepsSidebar
        currentStep={currentStep}
        onSelectStep={onSelectStep}
      />

      {/* Center Column: Active Step Form & Action Bar */}
      <div className="flex min-w-0 flex-col gap-4">
        <IncidentGlassCard
          paddingClassName="p-6 sm:p-7"
          className="rounded-[24px] border border-[rgba(15,23,42,0.06)] shadow-[0px_4px_24px_rgba(0,0,0,0.03)]"
        >
          {currentStep === 1 && (
            <IncidentClosureStepClassification
              data={data}
              onChangeField={onChangeField}
            />
          )}

          {currentStep === 2 && (
            <IncidentClosureStepRootCause
              data={data}
              onChangeField={onChangeField}
            />
          )}

          {currentStep === 3 && (
            <IncidentClosureStepPreventive
              data={data}
              onChangeField={onChangeField}
              onToggleCheckItem={onToggleCheckItem}
            />
          )}

          {currentStep === 4 && (
            <IncidentClosureStepReview
              data={data}
              onChangeField={onChangeField}
            />
          )}
        </IncidentGlassCard>

        {/* Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBackPrevious}
              className="rounded-[14px] bg-white px-4.5 py-2.5 text-[13px] font-bold text-[#1e293b] shadow-xs transition-colors hover:bg-[#f8fafc]"
            >
              {STEP_BACK_LABELS[currentStep as 2 | 3 | 4]}
            </button>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#64748b] transition-colors hover:text-[#0f172a]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSaveAsDraft}
              className="rounded-[14px] border-2 border-[#008ba3] bg-white px-5 py-2.5 text-[13px] font-bold text-[#008ba3] shadow-xs transition-colors hover:bg-[#d2eff4]/30"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handleProceedNext}
              disabled={
                isSubmitting ||
                (currentStep === 4 && data.closureStatus === "Closed")
              }
              className={[
                "rounded-[14px] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all",
                data.closureStatus === "Closed" && currentStep === 4
                  ? "cursor-default bg-emerald-600"
                  : "bg-[#008ba3] hover:bg-[#00788d] active:scale-[0.99]",
              ].join(" ")}
            >
              {isSubmitting ? "Processing…" : STEP_NEXT_LABELS[currentStep]}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Metadata Sidebar (Only when showMetadata is true) */}
      {showMetadata ? <IncidentClosureMetadataCard data={data} /> : null}
    </div>
  );
}
