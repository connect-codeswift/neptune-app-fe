import {
  DEFAULT_KPI_METRICS,
  type KpiMetricCardProps,
  type KpiMetricTone,
} from "@/components/KpiMetricCard";
import type { DashboardKpisDto } from "@/dtos/res/ehs-command-center-response.dto";
import { SHOW_KPI_TREND_BADGES } from "@/lib/kpi-display-flags";

const FALLBACK_TRIR_TARGET = 2.5;
const FALLBACK_LTIR_TARGET = 1.0;
const FALLBACK_COMPLIANCE_TARGET = 85;
const FALLBACK_CAPA_CLOSURE_TARGET = 80;

type Trend = Readonly<{
  label: string;
  direction: "up" | "down";
  tone: KpiMetricTone;
}>;

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

function toSparkline(
  trend: readonly number[] | null | undefined,
): readonly number[] | undefined {
  if (!trend || trend.length < 2) {
    return undefined;
  }

  return trend.map((value) => Number(value));
}

/**
 * Decorative lead-in when the API only returns a snapshot (no history series).
 * Matches the TRIR/LTIR card footer so all four KPIs share the same rhythm.
 */
function snapshotSparkline(
  value: number | null | undefined,
): readonly number[] | undefined {
  if (value == null || !Number.isFinite(value)) {
    return undefined;
  }

  const current = Math.max(0, value);
  return [
    current * 0.86,
    current * 0.9,
    current * 0.93,
    current * 0.95,
    current * 0.97,
    current * 0.99,
    current,
  ];
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

function optionalTrend(
  trend: Trend,
): Pick<KpiMetricCardProps, "trendValue" | "trendDirection" | "trendTone"> {
  if (!SHOW_KPI_TREND_BADGES) {
    return {
      trendValue: "",
      trendDirection: "down",
      trendTone: "positive",
    };
  }

  return {
    trendValue: trend.label,
    trendDirection: trend.direction,
    trendTone: trend.tone,
  };
}

/** Builds the 4 KPI cards from GET /api/EHSCommandCenter/GetMainDashboardKpis. */
export function mapDashboardKpisToMetrics(
  dto: DashboardKpisDto | null | undefined,
): readonly KpiMetricCardProps[] {
  if (!dto) {
    return DEFAULT_KPI_METRICS;
  }

  const trirTarget = dto.trirTarget ?? FALLBACK_TRIR_TARGET;
  const ltirTarget = dto.lostTimeInjuryRateTarget ?? FALLBACK_LTIR_TARGET;
  const complianceTarget = dto.complianceTarget ?? FALLBACK_COMPLIANCE_TARGET;
  const capaTarget = dto.capaClosureTarget ?? FALLBACK_CAPA_CLOSURE_TARGET;
  const ratesAvailable =
    dto.ratesAvailable ?? ((dto.workHoursYtd ?? 0) >= 5000);

  const trirTrend = trendForMaxTarget(
    ratesAvailable ? dto.trir : null,
    trirTarget,
  );
  const ltirTrend = trendForMaxTarget(
    ratesAvailable ? dto.lostTimeInjuryRate : null,
    ltirTarget,
  );
  const complianceTrend = trendForMinTargetPercent(
    dto.compliancePercentage,
    complianceTarget,
  );
  const capaTrend = trendForMinTargetPercent(
    dto.capaClosurePercentage,
    capaTarget,
  );

  return [
    {
      title: "Total Recordable Rate",
      value: ratesAvailable ? formatRate(dto.trir) : "—",
      unit: ratesAvailable ? "per 200k hrs" : "",
      ...optionalTrend(trirTrend),
      targetLabel: ratesAvailable
        ? `Target ≤ ${String(trirTarget)}`
        : "Add monthly work hours in Settings",
      chartData: ratesAvailable
        ? (toSparkline(dto.trirTrend) ?? snapshotSparkline(dto.trir))
        : undefined,
    },
    {
      title: "Lost Time Injury Rate",
      value: ratesAvailable ? formatRate(dto.lostTimeInjuryRate) : "—",
      unit: ratesAvailable ? "per 200k hrs" : "",
      ...optionalTrend(ltirTrend),
      targetLabel: ratesAvailable
        ? `Target ≤ ${String(ltirTarget)}`
        : "Add monthly work hours in Settings",
      chartData: ratesAvailable
        ? (toSparkline(dto.lostTimeInjuryRateTrend) ??
          snapshotSparkline(dto.lostTimeInjuryRate))
        : undefined,
    },
    {
      title: "Safety Compliance",
      value: formatPercent(dto.compliancePercentage),
      unit: "%",
      ...optionalTrend(complianceTrend),
      targetLabel: `Target ≥ ${String(complianceTarget)}%`,
      chartData: snapshotSparkline(dto.compliancePercentage),
    },
    {
      title: "Action Closure Rate",
      value: formatPercent(dto.capaClosurePercentage),
      unit: "%",
      ...optionalTrend(capaTrend),
      targetLabel: `Target ≥ ${String(capaTarget)}%`,
      chartData: snapshotSparkline(dto.capaClosurePercentage),
    },
  ];
}
