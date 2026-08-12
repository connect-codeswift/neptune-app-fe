export type CapaRcaWhyStep = Readonly<{
  id: string;
  text: string;
  /** Last filled step in a lane is shown as the root cause. */
  isRootCause?: boolean;
}>;

export type CapaRcaAction = Readonly<{
  id: string;
  text: string;
}>;

export type CapaRcaLane = Readonly<{
  id: string;
  category: string;
  /** Left category cell background (shared teal in Figma). */
  categoryClassName: string;
  /** Accent for labels, why badges, root cause, add-why (per Figma row). */
  accent: string;
  /** Soft fill behind the Add why plus icon. */
  accentSoft: string;
  /** Glow ring when root cause / editing. */
  accentGlow: string;
  contributingFactor: string;
  whys: readonly CapaRcaWhyStep[];
  actions: readonly CapaRcaAction[];
}>;

export type CapaRcaWorksheet = Readonly<{
  reportType: string;
  date: string;
  injury: string;
  description: string;
  lanes: readonly CapaRcaLane[];
}>;

/** Horizontal 5-Whys RCA seed — Figma 5472:19820. */
export const CAPA_RCA_WORKSHEET: CapaRcaWorksheet = {
  reportType: "Injury",
  date: "Apr 1, 2026",
  injury: "Facial laceration — forehead and nose (9 stitches)",
  description:
    "Employee was cutting coil banding on the Zee Line. The band did not fully cut, and when additional force was applied, the coil suddenly unwrapped and struck the employee in the forehead and nose.",
  lanes: [
    {
      id: "process",
      category: "Process / Procedures",
      categoryClassName: "bg-[rgba(8,145,166,0.13)]",
      accent: "#e6932e",
      accentSoft: "rgba(251,230,211,0.86)",
      accentGlow: "rgba(230,147,46,0.18)",
      contributingFactor:
        "The process was in place, but there was a lack of training because the employee was a new hire.",
      whys: [
        {
          id: "p1",
          text: "New-hire onboarding did not include a hands-on coil band-cutting walkthrough.",
        },
        {
          id: "p2",
          text: "The JHA / JSA for the task had not been reviewed in onboarding.",
          isRootCause: true,
        },
      ],
      actions: [
        {
          id: "pa1",
          text: "Review and update the JHA & JSA for coil band-cutting tasks.",
        },
        {
          id: "pa2",
          text: "Create a standardized coil band-cutting procedure.",
        },
      ],
    },
    {
      id: "behaviors",
      category: "Behaviors",
      categoryClassName: "bg-[rgba(8,145,166,0.13)]",
      accent: "#e0413b",
      accentSoft: "rgba(254,214,208,0.86)",
      accentGlow: "rgba(224,65,59,0.18)",
      contributingFactor:
        "Employee did not choose to use the pneumatic band cutter.",
      whys: [
        {
          id: "b1",
          text: "Additional snubber work was not lined up; using the cutter ergonomically was not possible.",
        },
        {
          id: "b2",
          text: "The faster manual method was the accepted norm on the line.",
          isRootCause: true,
        },
      ],
      actions: [
        {
          id: "ba1",
          text: "Conduct a safety stand-down focused on stored-energy hazards.",
        },
        {
          id: "ba2",
          text: "Provide refresher training on safe coil handling.",
        },
      ],
    },
    {
      id: "competency",
      category: "Competency / Skills",
      categoryClassName: "bg-[rgba(8,145,166,0.13)]",
      accent: "#7c8794",
      accentSoft: "rgba(228,232,236,0.86)",
      accentGlow: "rgba(124,135,148,0.18)",
      contributingFactor:
        "Training did not emphasize previous serious-injury events and did not cover the JSA.",
      whys: [
        {
          id: "c1",
          text: "Previous training focused more on production than coil energy release.",
        },
        {
          id: "c2",
          text: "Real incident examples had not been reviewed with the team.",
        },
        {
          id: "c3",
          text: "Training materials were outdated.",
        },
        {
          id: "c4",
          text: "JHA / JSA training did not connect hazards to consequences.",
        },
        {
          id: "c5",
          text: "Training effectiveness had not been recently evaluated.",
          isRootCause: true,
        },
      ],
      actions: [
        {
          id: "ca1",
          text: "Review previous SI injuries on the Zee Line with new hires during onboarding.",
        },
      ],
    },
    {
      id: "equipment",
      category: "Equipment",
      categoryClassName: "bg-[rgba(8,145,166,0.13)]",
      accent: "#2f7fd1",
      accentSoft: "rgba(208,225,246,0.86)",
      accentGlow: "rgba(47,127,209,0.18)",
      contributingFactor:
        "The available pneumatic cutter was not used during coil band-cutting.",
      whys: [
        {
          id: "e1",
          text: "The employee used a manual cutting method instead of the pneumatic cutter.",
        },
        {
          id: "e2",
          text: "The pneumatic cutter was not easy to use — snubber wheel not aligned or accessible.",
        },
        {
          id: "e3",
          text: "Standard work did not specify mandatory use of the pneumatic cutter.",
        },
        {
          id: "e4",
          text: "Change management for safer equipment was not consistently reinforced.",
          isRootCause: true,
        },
      ],
      actions: [
        {
          id: "ea1",
          text: "Update the JHA & JSA to require the pneumatic cutter for coil band-cutting, machine-specific.",
        },
      ],
    },
    {
      id: "ppe",
      category: "PPE",
      categoryClassName: "bg-[rgba(8,145,166,0.13)]",
      accent: "#d4a017",
      accentSoft: "rgba(245,233,209,0.86)",
      accentGlow: "rgba(212,160,23,0.18)",
      contributingFactor:
        "Eye / face protection was not enforced for the band-cutting task.",
      whys: [
        {
          id: "ppe1",
          text: "A face shield was not part of the required PPE for this task.",
        },
        {
          id: "ppe2",
          text: "PPE matrix had not been updated after prior near-misses involving coil banding.",
          isRootCause: true,
        },
      ],
      actions: [
        {
          id: "ppea1",
          text: "Update PPE requirements to include face shield for coil band-cutting.",
        },
      ],
    },
  ],
};

export function countRcaWhySteps(lanes: readonly CapaRcaLane[]): number {
  return lanes.reduce((sum, lane) => sum + lane.whys.length, 0);
}

export function countRcaActions(lanes: readonly CapaRcaLane[]): number {
  return lanes.reduce((sum, lane) => sum + lane.actions.length, 0);
}

const LANE_STYLE_TEMPLATES = CAPA_RCA_WORKSHEET.lanes.map((lane) => ({
  categoryClassName: lane.categoryClassName,
  accent: lane.accent,
  accentSoft: lane.accentSoft,
  accentGlow: lane.accentGlow,
}));

/** Maps GET /api/CAPA/Rca/{rcaId} factors onto the horizontal worksheet lanes. */
export function mapRcaFactorsToCapaLanes(
  factors: readonly Readonly<{
    id: number;
    description: string;
    rcaCategoryName: string;
    whys: readonly Readonly<{
      id: number;
      description: string;
      isRootCause: boolean;
    }>[];
    correctiveActions: readonly Readonly<{
      id: number;
      description: string;
    }>[];
  }>[],
): CapaRcaLane[] {
  if (factors.length === 0) {
    return CAPA_RCA_WORKSHEET.lanes.map((lane) => ({
      ...lane,
      contributingFactor: "",
      whys: [],
      actions: [],
    }));
  }

  return factors.map((factor, index) => {
    const style =
      LANE_STYLE_TEMPLATES[index % LANE_STYLE_TEMPLATES.length] ??
      LANE_STYLE_TEMPLATES[0]!;

    return {
      id: String(factor.id),
      category: factor.rcaCategoryName.trim() || `Category ${String(index + 1)}`,
      categoryClassName: style.categoryClassName,
      accent: style.accent,
      accentSoft: style.accentSoft,
      accentGlow: style.accentGlow,
      contributingFactor: factor.description,
      whys: factor.whys.map((why) => ({
        id: String(why.id),
        text: why.description,
        isRootCause: why.isRootCause,
      })),
      actions: factor.correctiveActions.map((action) => ({
        id: String(action.id),
        text: action.description,
      })),
    };
  });
}
