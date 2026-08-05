export type HrcaWhyStep = Readonly<{
  /** Persisted why id from GET /api/Rca/Incident/{id}. */
  id?: number;
  num: number;
  text: string;
  isRootCause?: boolean;
}>;

export type HrcaCorrectiveAction = Readonly<{
  /** Persisted corrective action id from GET /api/Rca/Incident/{id}. */
  id?: number;
  text: string;
}>;

export type HrcaRow = Readonly<{
  id: string;
  categoryId: number;
  category: string;
  /** Accent used for CF labels, Why badges, root-cause ring */
  accent: string;
  contributingFactorId: number | null;
  contributingFactor: string;
  whys: readonly HrcaWhyStep[];
  correctiveActions: readonly HrcaCorrectiveAction[];
}>;

export type HrcaMeta = Readonly<{
  reportType: string;
  date: string;
  injury: string;
  description: string;
}>;

export const HRCA_META: HrcaMeta = {
  reportType: "Injury",
  date: "Apr 1, 2026",
  injury: "Facial laceration — forehead and nose (9 stitches)",
  description:
    "Employee was cutting coil banding on the Zee Line. The band did not fully cut, and when additional force was applied, the coil suddenly unwrapped and struck the employee in the forehead and nose.",
};

export const INITIAL_HRCA_ROWS: readonly HrcaRow[] = [
  {
    id: "1",
    categoryId: 1,
    category: "Process / Procedures",
    accent: "#e6932e",
    contributingFactorId: null,
    contributingFactor:
      "The process was in place, but there was a lack of training because the employee was a new hire.",
    whys: [
      {
        num: 1,
        text: "New-hire onboarding did not include a hands-on coil band-cutting walkthrough.",
      },
      {
        num: 2,
        text: "The JHA / JSA for the task had not been reviewed in onboarding.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      { text: "Review and update the JHA & JSA for coil band-cutting tasks." },
      { text: "Create a standardized coil band-cutting procedure." },
    ],
  },
  {
    id: "2",
    categoryId: 2,
    category: "Behaviors",
    accent: "#e0413b",
    contributingFactorId: null,
    contributingFactor:
      "Employee did not choose to use the pneumatic band cutter.",
    whys: [
      {
        num: 1,
        text: "Additional snubber work was not lined up; using the cutter ergonomically was not possible.",
      },
      {
        num: 2,
        text: "The faster manual method was the accepted norm on the line.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      { text: "Conduct a safety stand-down focused on stored-energy hazards." },
      { text: "Provide refresher training on safe coil handling." },
    ],
  },
  {
    id: "3",
    categoryId: 3,
    category: "Competency / Skills",
    accent: "#7c8794",
    contributingFactorId: null,
    contributingFactor:
      "Training did not emphasize previous serious-injury events and did not cover the JSA.",
    whys: [
      {
        num: 1,
        text: "Previous training focused more on production than coil energy release.",
      },
      {
        num: 2,
        text: "Real incident examples had not been reviewed with the team.",
      },
      { num: 3, text: "Training materials were outdated." },
      {
        num: 4,
        text: "JHA / JSA training did not connect hazards to consequences.",
      },
      {
        num: 5,
        text: "Training effectiveness had not been recently evaluated.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      {
        text: "Review previous SI injuries on the Zee Line with new hires during onboarding.",
      },
    ],
  },
  {
    id: "4",
    categoryId: 4,
    category: "Equipment",
    accent: "#2f7fd1",
    contributingFactorId: null,
    contributingFactor:
      "The available pneumatic cutter was not used during coil band-cutting.",
    whys: [
      {
        num: 1,
        text: "The employee used a manual cutting method instead of the pneumatic cutter.",
      },
      {
        num: 2,
        text: "The pneumatic cutter was not easy to use — snubber wheel not aligned or accessible.",
      },
      {
        num: 3,
        text: "Standard work did not specify mandatory use of the pneumatic cutter.",
      },
      {
        num: 4,
        text: "Change management for safer equipment was not consistently reinforced.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      {
        text: "Update the JHA & JSA to require the pneumatic cutter for coil band-cutting, machine-specific.",
      },
    ],
  },
  {
    id: "5",
    categoryId: 5,
    category: "PPE",
    accent: "#d4a017",
    contributingFactorId: null,
    contributingFactor:
      "Eye / face protection was not enforced for the band-cutting task.",
    whys: [
      {
        num: 1,
        text: "A face shield was not part of the required PPE for this task.",
      },
      {
        num: 2,
        text: "The PPE assessment for coil handling had not been refreshed.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      {
        text: "Add face shield / impact eye protection to the PPE requirements for coil band-cutting.",
      },
    ],
  },
];

export function markRootCauses(
  whys: readonly HrcaWhyStep[],
): readonly HrcaWhyStep[] {
  if (whys.length === 0) return whys;
  return whys.map((why, index) => ({
    ...why,
    num: index + 1,
    isRootCause: index === whys.length - 1,
  }));
}
