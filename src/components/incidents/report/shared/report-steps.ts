export type ReportStepId = 1 | 2 | 3 | 4 | 5;

export type ReportStep = Readonly<{
  id: ReportStepId;
  title: string;
  description: string;
}>;

export const REPORT_STEPS: readonly ReportStep[] = [
  {
    id: 1,
    title: "What & where",
    description: "Severity, time, location, person",
  },
  {
    id: 2,
    title: "What happened",
    description: "Object, mechanism, description, photos",
  },
  {
    id: 3,
    title: "Injury & treatment",
    description: "Nature, body, treatment given",
  },
  {
    id: 4,
    title: "Classification & response",
    description: "SIP flag and actions taken",
  },
  {
    id: 5,
    title: "Review & submit",
    description: "Check before submitting",
  },
];

export const STEP_TIPS: Record<ReportStepId, string> = {
  1: "Pick the outcome severity once — OSHA recordability, DART, and SIA follow from it.",
  2: "Object → mechanism → description (above photos), then witnesses.",
  3: "Nature → body → treatment gated by severity. First Aid cannot pick clinic/ER.",
  4: "Only SIP (SIF Potential) is asked. SIA and SIF are derived — shown in the banner above.",
  5: "Review uses the same derivation as earlier steps: severity + SIP → SIA / SIF.",
};
