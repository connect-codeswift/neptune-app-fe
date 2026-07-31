import type { HazcomHazardRatings } from "@/components/hazcom/shared";

export type HazcomRiskAssessmentFormState = Readonly<{
  chemical: string;
  exposureScenario: string;
  exposureMinutes: string;
  frequency: string;
  ratings: HazcomHazardRatings;
  ppe: readonly string[];
  controls: string;
}>;

export const INITIAL_RISK_ASSESSMENT_FORM_STATE: HazcomRiskAssessmentFormState =
  {
    chemical: "",
    exposureScenario: "",
    exposureMinutes: "60",
    frequency: "",
    ratings: { health: 0, flammability: 0, reactivity: 0, ppeIndex: 0 },
    ppe: [],
    controls: "",
  };
