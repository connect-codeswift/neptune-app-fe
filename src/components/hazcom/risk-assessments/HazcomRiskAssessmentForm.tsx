"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_CHEMICALS,
  HAZCOM_PPE_OPTIONS,
  HazcomGlassCard,
  HazcomSelectField,
  HazcomTextareaField,
  HazcomTextField,
  type HazcomHazardRatings,
} from "@/components/hazcom/shared";
import { HazcomHazardRatingSelector } from "@/components/hazcom/risk-assessments/HazcomHazardRatingSelector";
import type { HazcomRiskAssessmentFormState } from "@/components/hazcom/risk-assessments/risk-assessment-form-state";

export type HazcomRiskAssessmentFormProps = Readonly<{
  values: HazcomRiskAssessmentFormState;
  onChange: (patch: Partial<HazcomRiskAssessmentFormState>) => void;
  className?: string;
}>;

const CHEMICAL_OPTIONS = [
  { value: "", label: "" },
  ...HAZCOM_CHEMICALS.map((chemical) => ({
    value: chemical.name,
    label: chemical.name,
  })),
];

function toggleValue(
  values: readonly string[],
  value: string,
): readonly string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function HazcomRiskAssessmentForm(
  props: Readonly<HazcomRiskAssessmentFormProps>,
) {
  const { values, onChange, className = "" } = props;
  const router = useRouter();

  const updateRating = (field: keyof HazcomHazardRatings, value: number) => {
    onChange({ ratings: { ...values.ratings, [field]: value } });
  };

  const togglePpe = (option: string) => {
    onChange({ ppe: toggleValue(values.ppe, option) });
  };

  const handleSubmitForReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard/hazcom/risk-assessments");
  };

  const handleSaveDraft = () => {
    router.push("/dashboard/hazcom/risk-assessments");
  };

  return (
    <HazcomGlassCard
      paddingClassName="p-6"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <form
        onSubmit={handleSubmitForReview}
        className="flex flex-col gap-5"
      >
        <HazcomSelectField
          label="Chemical"
          required
          value={values.chemical}
          onChange={(event) => onChange({ chemical: event.target.value })}
          options={CHEMICAL_OPTIONS}
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
          <Text as="p" className="text-ehs-darker text-[13px] font-bold">
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
          <Text as="p" className="text-ehs-darker text-[13px] font-bold">
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
                    "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    selected
                      ? "border-ehs-normal-blue text-ehs-dark-blue bg-white"
                      : "border-ehs-border text-ehs-gray hover:border-ehs-normal-blue/50 bg-white/60",
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
          <Link href="/dashboard/hazcom/risk-assessments">
            <Button type="button" variant="tertiary">
              <Icon
                icon="mdi:arrow-left"
                className="text-base"
                aria-hidden="true"
              />
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
            <Button type="submit" variant="primary">
              Submit for Review
            </Button>
          </div>
        </div>
      </form>
    </HazcomGlassCard>
  );
}
