import {
  DEFAULT_KPI_METRICS,
  type KpiMetricCardProps,
  type KpiMetricTone,
} from "@/components/KpiMetricCard";
import type { DashboardKpisDto } from "@/dtos/res/ehs-command-center-response.dto";

/**
 * Fixed business targets. The dashboard API returns only current-period
 * values (no prior period, no time series), so the trend badge below is
 * computed as the live gap to these thresholds — not a real
 * period-over-period delta, which this API can't supply.
 */
const TRIR_TARGET = 2.5; // lower is better
const LTIR_TARGET = 1.0; // lower is better
const COMPLIANCE_TARGET_PERCENT = 85; // higher is better
/** No CAPA-closure target exists elsewhere in the app — placeholder until confirmed. */
const CAPA_CLOSURE_TARGET_PERCENT = 80; // higher is better

type Trend = Readonly<{
  label: string;
  direction: "up" | "down";
  tone: KpiMetricTone;
}>;

/** Gap vs. a "lower is better" target (TRIR, LTIR). */
function trendForMaxTarget(
  value: number | null | undefined,
  target: number,
): Trend {
  if (value == null || !Number.isFinite(value)) {
    return { label: "—", direction: "down", tone: "negative" };
  }
  const gap = value - target;
  if (gap === 0) {
    return { label: "0.0", direction: "down", tone: "positive" };
  }
  return gap < 0
    ? {
        label: `-${Math.abs(gap).toFixed(1)}`,
        direction: "down",
        tone: "positive",
      }
    : { label: `+${gap.toFixed(1)}`, direction: "up", tone: "negative" };
}

/** Gap vs. a "higher is better" percentage target (compliance, CAPA closure). */
function trendForMinTargetPercent(
  value: number | null | undefined,
  target: number,
): Trend {
  if (value == null || !Number.isFinite(value)) {
    return { label: "—", direction: "down", tone: "negative" };
  }
  const gap = Math.round(value) - target;
  return gap >= 0
    ? { label: `+${String(gap)}pp`, direction: "up", tone: "positive" }
    : { label: `${String(gap)}pp`, direction: "down", tone: "negative" };
}

/**
 * Sparkline anchored on the two real numbers available: the fixed target
 * (start) and today's fetched API value (end). The API has no time series,
 * so the points in between are a straight-line interpolation, not real
 * history — but both endpoints are genuine data, not an arbitrary guess.
 */
function buildTargetAnchoredSeries(
  currentValue: number,
  target: number,
): readonly number[] {
  const points = 7;
  return Array.from({ length: points }, (_, index) => {
    const t = index / (points - 1);
    return Number((target + (currentValue - target) * t).toFixed(3));
  });
}

function formatRate(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value.toFixed(1);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return String(Math.round(value));
}

function formatCount(value: number | null | undefined): string | number {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value;
}

/** Builds the 4 KPI cards from GET /api/EHSCommandCenter/GetMainDashboardKpis. */
export function mapDashboardKpisToMetrics(
  dto: DashboardKpisDto | null | undefined,
): readonly KpiMetricCardProps[] {
  if (!dto) {
    return DEFAULT_KPI_METRICS;
  }

  const trirTrend = trendForMaxTarget(dto.trir, TRIR_TARGET);
  const ltirTrend = trendForMaxTarget(dto.lostTimeInjuryRate, LTIR_TARGET);
  const complianceTrend = trendForMinTargetPercent(
    dto.compliancePercentage,
    COMPLIANCE_TARGET_PERCENT,
  );
  const capaTrend = trendForMinTargetPercent(
    dto.capaClosurePercentage,
    CAPA_CLOSURE_TARGET_PERCENT,
  );

  return [
    {
      title: "Total Recordable Rate",
      value: formatRate(dto.trir),
      unit: "TRIR",
      trendValue: trirTrend.label,
      trendDirection: trirTrend.direction,
      trendTone: trirTrend.tone,
      targetLabel: `Target ≤ ${String(TRIR_TARGET)}`,
      chartData:
        dto.trir != null && Number.isFinite(dto.trir)
          ? buildTargetAnchoredSeries(dto.trir, TRIR_TARGET)
          : undefined,
    },
    {
      title: "Lost Time Injury Rate",
      value: formatRate(dto.lostTimeInjuryRate),
      unit: "LTIR",
      trendValue: ltirTrend.label,
      trendDirection: ltirTrend.direction,
      trendTone: ltirTrend.tone,
      targetLabel: `Target ≤ ${String(LTIR_TARGET)}`,
      chartData:
        dto.lostTimeInjuryRate != null &&
        Number.isFinite(dto.lostTimeInjuryRate)
          ? buildTargetAnchoredSeries(dto.lostTimeInjuryRate, LTIR_TARGET)
          : undefined,
    },
    {
      title: "Safety Compliance",
      value: formatPercent(dto.compliancePercentage),
      unit: "%",
      trendValue: complianceTrend.label,
      trendDirection: complianceTrend.direction,
      trendTone: complianceTrend.tone,
      counts: {
        closedLabel: "Closed Compliances",
        closedValue: formatCount(dto.compliantCount),
        totalLabel: "Total Compliances",
        totalValue: formatCount(dto.totalCompliance),
      },
    },
    {
      title: "Action Closure Rate",
      value: formatPercent(dto.capaClosurePercentage),
      unit: "%",
      trendValue: capaTrend.label,
      trendDirection: capaTrend.direction,
      trendTone: capaTrend.tone,
      counts: {
        closedLabel: "Closed CAPAs",
        closedValue: formatCount(dto.closedCapaCount),
        totalLabel: "Total CAPAs",
        totalValue: formatCount(dto.totalCapa),
      },
    },
  ];
}
