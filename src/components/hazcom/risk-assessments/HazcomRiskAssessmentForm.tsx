"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, type FormEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_PPE_OPTIONS,
  HazcomGlassCard,
  HazcomSelectField,
  HazcomTextareaField,
  HazcomTextField,
  hazcomRiskLevel,
  hazcomRiskScore,
  type HazcomHazardRatings,
} from "@/components/hazcom/shared";
import { HazcomHazardRatingSelector } from "@/components/hazcom/risk-assessments/HazcomHazardRatingSelector";
import type { HazcomRiskAssessmentFormState } from "@/components/hazcom/risk-assessments/risk-assessment-form-state";
import type { ChemicalRiskAssessmentRequestDto } from "@/dtos/req/hazcom-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateRiskAssessmentMutation } from "@/hooks/use-hazcom-mutations";
import { useChemicalNamesQuery } from "@/hooks/use-hazcom-queries";
import { toast } from "@/lib/toast";

export type HazcomRiskAssessmentFormProps = Readonly<{
  values: HazcomRiskAssessmentFormState;
  onChange: (patch: Partial<HazcomRiskAssessmentFormState>) => void;
  className?: string;
}>;

const ASSESSMENTS_ROUTE = "/dashboard/hazcom/risk-assessments";

function toggleValue(
  values: readonly string[],
  value: string,
): readonly string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toAssessmentRequest(
  values: HazcomRiskAssessmentFormState,
  isDraft: boolean,
): ChemicalRiskAssessmentRequestDto {
  const score = hazcomRiskScore(values.ratings);

  return {
    chemicalId: Number(values.chemicalId),
    description: values.exposureScenario.trim(),
    // Free text on the wire; the field collects minutes.
    exposureDuration: values.exposureMinutes.trim(),
    frequency: values.frequency.trim(),
    hazardHealthRating: values.ratings.health,
    hazardFlammabilityRating: values.ratings.flammability,
    hazardReactivityRating: values.ratings.reactivity,
    hazardPpeIndexRating: values.ratings.ppeIndex,
    recommendedPpe: values.ppe.join(", "),
    notes: values.controls.trim(),
    // Both are derived here so the stored row matches what the panel showed.
    riskLevel: hazcomRiskLevel(score),
    riskScore: score,
    isDraft,
  };
}

export function HazcomRiskAssessmentForm(
  props: Readonly<HazcomRiskAssessmentFormProps>,
) {
  const { values, onChange, className = "" } = props;
  const router = useRouter();
  const createAssessment = useCreateRiskAssessmentMutation();
  const {
    chemicals,
    isLoading: isLoadingChemicals,
    errorMessage: chemicalsError,
  } = useChemicalNamesQuery();

  const chemicalOptions = useMemo(
    () => [
      {
        value: "",
        label: isLoadingChemicals ? "Loading chemicals…" : "Select a chemical…",
      },
      ...chemicals.map((chemical) => ({
        value: String(chemical.id),
        label: chemical.name,
      })),
    ],
    [chemicals, isLoadingChemicals],
  );

  const updateRating = (field: keyof HazcomHazardRatings, value: number) => {
    onChange({ ratings: { ...values.ratings, [field]: value } });
  };

  const togglePpe = (option: string) => {
    onChange({ ppe: toggleValue(values.ppe, option) });
  };

  const save = (isDraft: boolean) => {
    // `chemicalId` is the only field the endpoint requires; the scenario is
    // asterisked in the form, so it is enforced on submit but not on a draft.
    if (values.chemicalId === "") {
      toast.error("Chemical is required");
      return;
    }
    if (!isDraft && values.exposureScenario.trim() === "") {
      toast.error("Exposure Scenario / Task Description is required");
      return;
    }

    createAssessment.mutate(toAssessmentRequest(values, isDraft), {
      onSuccess: () => {
        toast.success(
          isDraft
            ? "Assessment saved as draft"
            : "Assessment submitted for review",
        );
        router.push(ASSESSMENTS_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the assessment. Please try again.",
          ),
        );
      },
    });
  };

  const handleSubmitForReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save(false);
  };

  return (
    <HazcomGlassCard
      paddingClassName="p-6"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <form onSubmit={handleSubmitForReview} className="flex flex-col gap-5">
        <HazcomSelectField
          label="Chemical"
          required
          value={values.chemicalId}
          onChange={(event) => onChange({ chemicalId: event.target.value })}
          options={chemicalOptions}
          hint={chemicalsError ?? undefined}
        />

        <HazcomTextareaField
          label="Exposure Scenario / Task Description"
          required
          placeholder="Describe the task and how the worker is exposed..."
          value={values.exposureScenario}
          onChange={(event) =>
            onChange({ exposureScenario: event.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HazcomTextField
            label="Exposure Duration (min)"
            type="number"
            min={0}
            value={values.exposureMinutes}
            onChange={(event) =>
              onChange({ exposureMinutes: event.target.value })
            }
          />
          <HazcomTextField
            label="Frequency"
            value={values.frequency}
            onChange={(event) => onChange({ frequency: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Text as="p" className="text3 text-ehs-darker">
            Hazard Ratings (0-4)
          </Text>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HazcomHazardRatingSelector
              label="Health"
              value={values.ratings.health}
              onChange={(value) => updateRating("health", value)}
            />
            <HazcomHazardRatingSelector
              label="Flammability"
              value={values.ratings.flammability}
              onChange={(value) => updateRating("flammability", value)}
            />
            <HazcomHazardRatingSelector
              label="Reactivity"
              value={values.ratings.reactivity}
              onChange={(value) => updateRating("reactivity", value)}
            />
            <HazcomHazardRatingSelector
              label="PPE Index"
              value={values.ratings.ppeIndex}
              onChange={(value) => updateRating("ppeIndex", value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Text as="p" className="text3 text-ehs-darker">
            Recommended PPE
          </Text>
          <div className="flex flex-wrap gap-2">
            {HAZCOM_PPE_OPTIONS.map((option) => {
              const selected = values.ppe.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePpe(option)}
                  className={[
                    "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 transition-colors",
                    selected
                      ? "border-ehs-normal-blue text7 text-ehs-dark-blue bg-white"
                      : "border-ehs-border text8 text-ehs-gray hover:border-ehs-normal-blue/50 bg-white/60",
                  ].join(" ")}
                >
                  {selected ? (
                    <Icon
                      icon="mdi:check"
                      className="size-3"
                      aria-hidden="true"
                    />
                  ) : null}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <HazcomTextareaField
          label="Controls / Mitigation Notes"
          placeholder="Engineering controls, administrative controls, substitution, elimination..."
          value={values.controls}
          onChange={(event) => onChange({ controls: event.target.value })}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
          <Link href={ASSESSMENTS_ROUTE}>
            <Button type="button" variant="tertiary">
              <Icon
                icon="mdi:arrow-left"
                className="size-4"
                aria-hidden="true"
              />
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={createAssessment.isPending}
              onClick={() => save(true)}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createAssessment.isPending}
            >
              {createAssessment.isPending ? "Saving…" : "Submit for Review"}
            </Button>
          </div>
        </div>
      </form>
    </HazcomGlassCard>
  );
}
