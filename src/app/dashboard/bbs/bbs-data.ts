/** One week of observation counts on the engagement chart. */
export type EngagementPoint = Readonly<{
  /** X-axis label, e.g. "W1". */
  label: string;
  safe: number;
  atRisk: number;
}>;

export const ENGAGEMENT_SERIES: readonly EngagementPoint[] = [
  { label: "W1", safe: 8, atRisk: 3 },
  { label: "W2", safe: 9, atRisk: 4 },
  { label: "W3", safe: 10, atRisk: 5 },
  { label: "W4", safe: 11, atRisk: 4 },
  { label: "W5", safe: 12, atRisk: 6 },
  { label: "W6", safe: 11, atRisk: 7 },
  { label: "W7", safe: 13, atRisk: 6 },
  { label: "W8", safe: 14, atRisk: 9 },
];

/** Tone drives the bar colour; "info" is the low-severity category. */
export type BehaviorTone = "risk" | "info";

export type BehaviorCategory = Readonly<{
  label: string;
  count: number;
  tone: BehaviorTone;
}>;

export const AT_RISK_BEHAVIORS: readonly BehaviorCategory[] = [
  { label: "PPE not worn correctly", count: 12, tone: "risk" },
  { label: "Improper lifting", count: 9, tone: "risk" },
  { label: "Pedestrian / FPV", count: 6, tone: "risk" },
  { label: "Housekeeping", count: 5, tone: "risk" },
  { label: "Eye / Face protection", count: 3, tone: "info" },
];
