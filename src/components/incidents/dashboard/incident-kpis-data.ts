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
  /**
   * Replaces TargetProgress. `""` hides the meter (hours missing; a banner
   * explains). A non-empty string is an error caption.
   */
  footerNote?: string;
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

export const INCIDENT_KPIS_FOOTNOTE =
  "Sample values are illustrative. RIR / TIR computed per 200,000 hours worked. SIA / SIP labels pending confirmation. Hearing Loss, RL Hearing Loss and Driver/Field Service Recordable counts intentionally omitted per spec.";
