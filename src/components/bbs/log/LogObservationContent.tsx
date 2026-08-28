"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateBbsObservationMutation } from "@/hooks/use-bbs-mutations";
import { useBehaviorCategoriesQuery } from "@/hooks/use-bbs-queries";
import { toCreateBbsObservationRequest } from "@/lib/map-bbs";
import { toast } from "@/lib/toast";
import { LogObservationHeader } from "./LogObservationHeader";
import { ObservationStepper } from "./ObservationStepper";
import { ObservationDetailsStep } from "./ObservationDetailsStep";
import { ObservationReviewStep } from "./ObservationReviewStep";
import { ObservationTypeStep } from "./ObservationTypeStep";
import type { ObservationFormValues } from "./observation-form-schema";

const BBS_ROUTE = "/dashboard/bbs";
const LAST_STEP = 3;

/** Form ids — the footer buttons submit these so validation gates navigation. */
const STEP_FORM_IDS: Record<number, string> = {
  1: "observation-step-1-form",
  2: "observation-step-2-form",
};

function toObservationFormValues(
  values: Record<string, string | string[]>,
): ObservationFormValues {
  const photos = Array.isArray(values.photos) ? values.photos : [];

  return {
    observationType:
      typeof values.observationType === "string" ? values.observationType : "",
    category: typeof values.category === "string" ? values.category : "",
    location: typeof values.location === "string" ? values.location : "",
    description:
      typeof values.description === "string" ? values.description : "",
    photos,
  };
}

export function LogObservationContent() {
  const router = useRouter();
  const createObservation = useCreateBbsObservationMutation();
  // Held past the response: `isPending` drops when the record is created,
  // while the push to the list is still in flight. A click in that gap logged
  // a duplicate.
  const submitLock = useSubmitLock();
  const categoriesQuery = useBehaviorCategoriesQuery();
  const [step, setStep] = useState(1);

  // Shared across steps so re-entering a step restores what was typed.
  const [values, setValues] = useState<Record<string, string | string[]>>({
    observationType: "",
    category: "",
    location: "",
    description: "",
    photos: [],
  });
  const commitValues = (next: Record<string, string | string[]>) => {
    setValues(next);
  };

  /** Step 1's form passed validation — persist and advance. */
  const handleStepOneSubmit = (
    submitted: Record<string, string | string[]>,
  ) => {
    setValues(submitted);
    setStep(2);
  };

  /** Step 2's form passed validation — persist and advance to review. */
  const handleStepTwoSubmit = (
    submitted: Record<string, string | string[]>,
  ) => {
    setValues(submitted);
    setStep(3);
  };

  const handleSubmit = () => {
    const formValues = toObservationFormValues(values);
    const payload = toCreateBbsObservationRequest(
      formValues,
      categoriesQuery.data ?? [],
    );
    if (!payload) {
      toast.error("Select a behavior category from the list.");
      setStep(1);
      return;
    }
    if (!submitLock.acquire()) {
      return;
    }

    createObservation.mutate(payload, {
      onSuccess: () => {
        toast.success("Observation logged");
        router.push(BBS_ROUTE);
      },
      onError: (error) => {
        submitLock.release();
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the observation. Please try again.",
          ),
        );
      },
    });
  };

  const formId = STEP_FORM_IDS[step];

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <div className="px-4">
        <LogObservationHeader />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 px-4 pt-4 pb-8 md:gap-6 md:pt-6">
        <div className="w-full max-w-130 overflow-x-auto">
          <ObservationStepper currentStep={step} />
        </div>

        <IncidentGlassCard
          paddingClassName="p-4 md:p-6"
          className="w-full max-w-130"
          incidentGlassCardClassName="gap-4 md:gap-6"
        >
          {step === 1 ? (
            <ObservationTypeStep
              initialValues={values}
              onChange={commitValues}
              onValidSubmit={handleStepOneSubmit}
              formId={formId}
            />
          ) : step === 2 ? (
            <ObservationDetailsStep
              initialValues={values}
              onChange={commitValues}
              onValidSubmit={handleStepTwoSubmit}
              formId={formId}
            />
          ) : (
            <ObservationReviewStep values={values} />
          )}

          <div className="flex items-center gap-3 md:justify-end">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  // From review, "Edit" goes back to the start of the form.
                  setStep(step === LAST_STEP ? 1 : step - 1);
                }}
                className="text-ehs-dark-bg rounded-2.5 border-ehs-border-ink/12 bg-ehs-surface hover:bg-ehs-surface-inverse/5 h-11 flex-1 cursor-pointer border px-4 py-2.5 text-sm font-medium transition-colors md:h-auto md:flex-none md:px-5 md:text-base"
              >
                {step === LAST_STEP ? "Edit" : "Back"}
              </button>
            ) : null}

            {step === LAST_STEP ? (
              <Button
                type="button"
                variant="primary"
                isLoading={submitLock.isLocked}
                onClick={handleSubmit}
                className="rounded-2.5 h-11 flex-1 px-4 py-2.5 text-sm font-semibold shadow-(--ehs-shadow-button-primary-flat) md:h-auto md:flex-none md:px-5 md:text-base"
              >
                {submitLock.isLocked ? "Submitting..." : "Submit Observation"}
              </Button>
            ) : (
              /* Submits the step's form so its required-field validation runs. */
              <Button
                type="submit"
                form={formId}
                variant="primary"
                className="rounded-2.5 h-11 flex-1 gap-2 px-4 py-2.5 text-sm font-semibold shadow-(--ehs-shadow-button-primary-flat) md:h-auto md:flex-none md:px-5 md:text-base"
              >
                {step === 2 ? "Review" : "Continue"}
                <Icon
                  icon="mdi:arrow-right"
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
