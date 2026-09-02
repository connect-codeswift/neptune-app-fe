"use client";

import { Icon } from "@iconify/react";
import { formatShortDateTime } from "@/lib/format-short-date-time";
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
import {
  validateClosureStep,
  validateClosureStepsBefore,
} from "@/components/incidents/detail/closure/closure-step-validation";
import { toast } from "@/lib/toast";

export type IncidentDetailClosureCardProps = Readonly<{
  data: IncidentClosureData;
  onSelectStep: (step: ClosureStepId) => void;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleCheckItem: (itemId: string) => void;
  /** Sends the closer to the Linked CAPA tab from the Preventive Measures step. */
  onManageCapas?: () => void;
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

/** Names the resume card uses, matching the sidebar's own wording. */
const STEP_TITLES: Record<ClosureStepId, string> = {
  1: "Classification",
  2: "Root Cause",
  3: "Preventive Measures",
  4: "Review & Sign-off",
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
    onManageCapas,
    onSaveAsDraft,
    onFinalizeClosure,
    onCancel,
    isSubmitting = false,
  } = props;

  const currentStep = data.currentStep;
  const maxAccessibleStep = data.maxAccessibleStep ?? 1;

  /*
   * Where a saved draft picks up again.
   *
   * `draftStep` is the step the closer was on when they pressed Save as Draft,
   * kept apart from `currentStep` so the wizard still reopens on Classification
   * — that is what gives them a step 1 to see the button on.
   *
   * `draftSavedAt` is required as well, so paging forward and back without ever
   * saving does not claim there is a draft to return to. Past step 1 the closer
   * is already at or beyond the saved point, so the slot stays Save as Draft.
   */
  const hasSavedDraft =
    data.draftSavedAt.trim() !== "" && data.closureStatus !== "Closed";
  const resumeStep: ClosureStepId | null =
    currentStep === 1 && hasSavedDraft && data.draftStep > 1
      ? data.draftStep
      : null;

  const savedAt = data.draftSavedAt.trim() ? new Date(data.draftSavedAt) : null;
  const savedAtLabel =
    savedAt && !Number.isNaN(savedAt.getTime())
      ? ` on ${formatShortDateTime(savedAt)}`
      : "";

  /**
   * Sidebar navigation follows the same rule as the incident report stepper:
   * going back is always allowed; jumping forward is only allowed into steps
   * already unlocked via Proceed.
   */
  const goToStep = (step: ClosureStepId) => {
    if (step > maxAccessibleStep) {
      toast.error(
        "Complete the current step",
        "Fill in the required fields and use Proceed to unlock the next step.",
      );
      return;
    }

    if (step > currentStep) {
      const validationError = validateClosureStepsBefore(step, data);
      if (validationError) {
        toast.error("Validation Error", validationError);
        return;
      }
    }

    onSelectStep(step);
  };

  const handleProceedNext = () => {
    const validationError = validateClosureStep(currentStep, data);
    if (validationError) {
      toast.error("Validation Error", validationError);
      return;
    }

    if (currentStep < 4) {
      const nextStep = (currentStep + 1) as ClosureStepId;
      onChangeField(
        "maxAccessibleStep",
        Math.max(
          maxAccessibleStep,
          nextStep,
        ) as IncidentClosureData["maxAccessibleStep"],
      );
      onSelectStep(nextStep);
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
        "mt-4 grid grid-cols-1 items-start gap-6",
        showMetadata
          ? "xl:grid-cols-[240px_minmax(0,1fr)_340px]"
          : "xl:grid-cols-[240px_minmax(0,1fr)]",
      ].join(" ")}
    >
      {/* Left Column: Steps Navigation Sidebar */}
      <IncidentClosureStepsSidebar
        currentStep={currentStep}
        maxAccessibleStep={maxAccessibleStep}
        onSelectStep={goToStep}
      />

      {/* Center Column: Active Step Form & Action Bar */}
      <div className="flex min-w-0 flex-col gap-4">
        {/*
          `z-10` so the Final Incident Type menu can escape upward.

          IncidentGlassCard carries `backdrop-blur`, and a backdrop filter
          creates a stacking context — which traps GlassSelect's `absolute
          z-20` menu inside this card. The action bar below is a sibling card
          with its own backdrop filter and no z-index, so DOM order decided and
          it painted over the open list. Ordering the two cards fixes it for
          every field on every step, rather than for this one dropdown.
        */}
        <IncidentGlassCard
          paddingClassName="p-5.5"
          incidentGlassCardClassName="gap-4.5"
          className="backdrop-blur-2.5 bg-ehs-surface/[0.62] z-10 shadow-none"
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
              onManageCapas={onManageCapas}
            />
          )}

          {currentStep === 4 && (
            <IncidentClosureStepReview
              data={data}
              onChangeField={onChangeField}
              onGoToStep={goToStep}
            />
          )}
        </IncidentGlassCard>

        {/* Bottom Action Bar — `z-0` is stated rather than left to DOM order,
            so the pairing with the step card above reads as deliberate. */}
        <IncidentGlassCard
          paddingClassName="p-5"
          className="rounded-4 backdrop-blur-2.5 border-t-ehs-border bg-ehs-surface/[0.62] z-0 shadow-none"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBackPrevious}
                className="rounded-2.5 text4 text-ehs-dark-bg hover:bg-ehs-light-bg bg-ehs-surface px-4.5 py-2.5 font-bold shadow-xs transition-colors"
              >
                {STEP_BACK_LABELS[currentStep as 2 | 3 | 4]}
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onCancel?.()}
                className="text4 text-ehs-gray hover:text-ehs-dark-bg px-3.5 py-2.5 font-bold transition-colors"
              >
                Cancel
              </button>

              {/*
                On step 1 with a draft waiting, this slot resumes instead of
                saving.

                Saving from step 1 over a draft that reached step 3 is the one
                thing the closer cannot want here — it writes the position back
                to 1 and buries their own work. Offering the way back in is the
                useful action, and it is only ever offered where the alternative
                is destructive: from step 2 onward the closer is already at or
                past the saved point, so the button stays Save as Draft.
              */}
              {resumeStep === null ? (
                <button
                  type="button"
                  onClick={onSaveAsDraft}
                  className="rounded-2.5 border-ehs-normal-blue text4 text-ehs-normal-blue bg-ehs-surface hover:bg-ehs-normal-blue/6 border px-4 py-2.5 font-bold transition-colors"
                >
                  Save as Draft
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectStep(resumeStep)}
                  title={`Draft saved${savedAtLabel}. Continue from ${STEP_TITLES[resumeStep]}.`}
                  className="rounded-2.5 border-ehs-normal-blue text4 text-ehs-normal-blue bg-ehs-normal-blue/8 hover:bg-ehs-normal-blue/14 inline-flex items-center gap-2 border px-4 py-2.5 font-bold transition-colors"
                >
                  <Icon
                    icon="mdi:file-document-edit-outline"
                    className="size-4.5 shrink-0"
                    aria-hidden="true"
                  />
                  Drafts
                </button>
              )}

              <button
                type="button"
                onClick={handleProceedNext}
                disabled={
                  isSubmitting ||
                  (currentStep === 4 && data.closureStatus === "Closed")
                }
                className={[
                  "rounded-2.5 text4 text-ehs-light-text px-5 py-2.5 font-bold transition-all",
                  data.closureStatus === "Closed" && currentStep === 4
                    ? "bg-ehs-green-hover cursor-not-allowed"
                    : "bg-ehs-normal-blue hover:bg-ehs-normal-blue-active active:scale-[0.99]",
                ].join(" ")}
              >
                {isSubmitting ? "Processing…" : STEP_NEXT_LABELS[currentStep]}
              </button>
            </div>
          </div>
        </IncidentGlassCard>
      </div>

      {/* Right Column: Metadata Sidebar (Only when showMetadata is true) */}
      {showMetadata ? <IncidentClosureMetadataCard data={data} /> : null}
    </div>
  );
}
