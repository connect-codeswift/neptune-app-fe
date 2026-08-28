export type ReportStepId = 1 | 2 | 3 | 4 | 5;

export type ReportStep = Readonly<{
  id: ReportStepId;
  title: string;
  description: string;
}>;

export const REPORT_STEPS: readonly ReportStep[] = [
  {
    id: 1,
    title: "What happened",
    description: "Type, severity, time, location",
  },
  {
    id: 2,
    title: "Details",
    description: "Description, photos, witnesses",
  },
  {
    id: 3,
    title: "People & injury",
    description: "Injuries, body part, treatment",
  },
  {
    id: 4,
    title: "Immediate response",
    description: "Actions already taken",
  },
  {
    id: 5,
    title: "Review & submit",
    description: "Check before submitting",
  },
];

export const STEP_TIPS: Record<ReportStepId, string> = {
  1: "Pick a type that fits — when unsure, choose the higher severity. EHS will adjust if needed.",
  2: 'A clear title beats a perfect one. "Hose rupture, Line 2" is great. Photos help everyone.',
  3: "First aid means treatment beyond a band-aid. Lost time = unable to return for the next shift.",
  4: "Note actions already taken — isolation, LOTO, notifications, and containment.",
  5: "Review classifications and attachments before submitting to EHS.",
};
