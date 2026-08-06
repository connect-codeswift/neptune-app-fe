export type TargetDirection = "lower-better" | "higher-better";

export type TargetStatus = "on" | "off";

export type HeroKpiMetric = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  value: string;
  unit?: string;
  target: number | null;
  current: number;
  targetLabel: string | null;
  direction: TargetDirection;
  chartData: readonly number[];
  /** When omitted, derived from target/current. Null hides the status pill. */
  status?: TargetStatus | null;
}>;

export type SiteRecordable = Readonly<{
  site: string;
  count: number;
}>;

export type IndicatorMetric = Readonly<{
  id: string;
  title: string;
  value: string;
  /** When true, render TargetProgress. When false, omit the indicator entirely. */
  hasIndicator: boolean;
  target?: number;
  current?: number;
  targetLabel?: string;
  direction?: TargetDirection;
  footnote?: string;
  titleDot?: string;
  titleLines?: readonly [string, string];
  span?: "normal" | "wide";
}>;

export const HERO_KPI_METRICS: readonly HeroKpiMetric[] = [
  {
    id: "rir",
    title: "RIR",
    subtitle: "Recordable Incident Rate",
    value: "2.3",
    target: 2.5,
    current: 2.3,
    targetLabel: "Target 2.5 · per 200k hrs",
    direction: "lower-better",
    chartData: [3.1, 2.9, 2.7, 2.8, 2.5, 2.4, 2.3],
  },
  {
    id: "tir",
    title: "TIR",
    subtitle: "Total Incident Rate",
    value: "4.1",
    target: 4.5,
    current: 4.1,
    targetLabel: "Target 4.5 · per 200k hrs",
    direction: "lower-better",
    chartData: [5.2, 4.9, 4.7, 4.6, 4.4, 4.2, 4.1],
  },
  {
    id: "mttc",
    title: "MTTC",
    subtitle: "Mean Time to Close",
    value: "12.4",
    unit: "d",
    target: 14,
    current: 12.4,
    targetLabel: "Target 14 · days",
    direction: "lower-better",
    chartData: [16, 15, 14.5, 14, 13.2, 12.8, 12.4],
  },
];

export const RECORDABLE_MONTHS = [
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
] as const;

export const RECORDABLE_SERIES = [4, 3, 5, 4, 3, 2, 3, 2, 3, 2, 1, 2] as const;
export const RECORDABLE_TARGET = 3;

export const RECORDABLES_BY_SITE: readonly SiteRecordable[] = [
  { site: "Plant A", count: 12 },
  { site: "Plant B", count: 9 },
  { site: "Warehouse 1", count: 5 },
  { site: "Warehouse 2", count: 4 },
  { site: "Warehouse 3", count: 2 },
  { site: "HQ", count: 0 },
];

export const INDICATOR_METRICS: readonly IndicatorMetric[] = [
  {
    id: "total-recordable",
    title: "Total Recordable Injuries",
    value: "32",
    hasIndicator: true,
    current: 32,
    target: 28,
    targetLabel: "Target 28",
    direction: "lower-better",
    footnote: "Drives RIR",
  },
  {
    id: "lost-time",
    title: "Lost Time Count",
    value: "10",
    hasIndicator: true,
    current: 10,
    target: 8,
    targetLabel: "Target 8",
    direction: "lower-better",
  },
  {
    id: "restricted-work",
    title: "Restricted Work Count",
    value: "11",
    hasIndicator: true,
    current: 11,
    target: 10,
    targetLabel: "Target 10",
    direction: "lower-better",
  },
  {
    id: "medical-only",
    title: "Medical Only Count",
    value: "11",
    hasIndicator: true,
    current: 11,
    target: 12,
    targetLabel: "Target 12",
    direction: "lower-better",
    footnote: "Beyond first aid",
  },
  {
    id: "first-aid",
    title: "First Aid Count",
    value: "132",
    hasIndicator: false,
    footnote: "Leading indicator · no target",
  },
  {
    id: "fatality",
    title: "Fatality Count",
    value: "0",
    hasIndicator: true,
    current: 0,
    target: 0,
    targetLabel: "Target 0",
    direction: "lower-better",
  },
  {
    id: "lost-days",
    title: "Lost Days",
    value: "234",
    hasIndicator: true,
    current: 234,
    target: 200,
    targetLabel: "Target 200",
    direction: "lower-better",
  },
  {
    id: "restricted-days",
    title: "Restricted Days",
    value: "341",
    hasIndicator: true,
    current: 341,
    target: 300,
    targetLabel: "Target 300",
    direction: "lower-better",
  },
  {
    id: "sia",
    title: "SIA Count",
    value: "3",
    hasIndicator: true,
    current: 3,
    target: 0,
    targetLabel: "Target 0",
    direction: "lower-better",
    titleDot: "var(--ehs-red)",
  },
  {
    id: "sip",
    title: "SIP Count",
    value: "9",
    hasIndicator: false,
    footnote: "Leading indicator · no target",
    titleDot: "var(--ehs-gray)",
  },
  {
    id: "near-miss",
    title: "Near Miss Count",
    value: "434",
    hasIndicator: true,
    current: 434,
    target: 400,
    targetLabel: "Target 400",
    direction: "higher-better",
  },
  {
    id: "hazard-id",
    title: "Hazard ID Count",
    value: "1,416",
    hasIndicator: true,
    current: 1416,
    target: 1200,
    targetLabel: "Target 1,200",
    direction: "higher-better",
  },
];

export const INJURY_MIX = [
  { label: "Fatality", value: 32, color: "var(--ehs-green)" },
  { label: "Restricted Work", value: 11, color: "var(--ehs-normal-blue)" },
  { label: "Lost Time", value: 11, color: "var(--ehs-yellow)" },
  { label: "Medical Only", value: 10, color: "var(--ehs-red)" },
] as const;

export const INJURY_MIX_TOTAL = 32;

export const INCIDENT_KPIS_FOOTNOTE =
  "Sample values are illustrative. RIR / TIR computed per 200,000 hours worked. SIA / SIP labels pending confirmation. Hearing Loss, RL Hearing Loss and Driver/Field Service Recordable counts intentionally omitted per spec.";
