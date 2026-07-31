import type { HazcomHazardRatings } from "@/components/hazcom/shared";

export type HazcomRiskAssessmentFormState = Readonly<{
  /**
   * Row id from GET /api/hazcom/chemical/names, kept as a string because that
   * is what the `<select>` yields. The assessment endpoint requires the id,
   * not the chemical's name.
   */
  chemicalId: string;
  exposureScenario: string;
  exposureMinutes: string;
  frequency: string;
  ratings: HazcomHazardRatings;
  ppe: readonly string[];
  controls: string;
}>;

export const INITIAL_RISK_ASSESSMENT_FORM_STATE: HazcomRiskAssessmentFormState =
  {
    chemicalId: "",
    exposureScenario: "",
    exposureMinutes: "60",
    frequency: "",
    ratings: { health: 0, flammability: 0, reactivity: 0, ppeIndex: 0 },
    ppe: [],
    controls: "",
  };
