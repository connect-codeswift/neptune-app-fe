import type { MetricCardProps } from "@/components/ui/MetricCard";
import type { DashboardKpisDto } from "@/dtos/res/ehs-command-center-response.dto";

const FALLBACK_TRIR_TARGET = 2.5;
const FALLBACK_LTIR_TARGET = 1.0;
const FALLBACK_COMPLIANCE_TARGET = 85;
const FALLBACK_CAPA_CLOSURE_TARGET = 80;

/** Shown before the first fetch resolves and whenever the payload is empty. */
export const DEFAULT_DASHBOARD_KPIS: readonly MetricCardProps[] = [
  {
    title: "Total Recordable Rate",
    value: "2.3",
    unit: "TRIR",
    target: 2.5,
    targetLabel: "Target ≤ 2.5",
    isMorePositive: false,
    signalOwnedBy: "target",
    trend: [3.2, 2.9, 2.8, 2.6, 2.5, 2.4, 2.3],
  },
  {
    title: "Lost Time Injury Rate",
    value: "0.8",
    unit: "LTIR",
    target: 1,
    targetLabel: "Target ≤ 1.0",
    isMorePositive: false,
    signalOwnedBy: "target",
    trend: [1.2, 1.1, 1, 0.95, 0.9, 0.85, 0.8],
  },
  {
    title: "Safety Compliance",
    value: "78",
    unit: "%",
    target: 85,
    targetLabel: "Target ≥ 85%",
    signalOwnedBy: "target",
    trend: [68, 70, 72, 74, 75, 76, 78],
  },
  {
    title: "Action Closure Rate",
    value: "84",
    unit: "%",
    target: 80,
    targetLabel: "Target ≥ 80%",
    signalOwnedBy: "target",
    trend: [74, 76, 78, 80, 81, 82, 84],
  },
];

/**
 * Real history only. A synthesised lead-in used to fill this in, but the card
 * now reads its delta badge off the series — inventing points would invent a
 * movement to go with them.
 */
function toSparkline(
  trend: readonly number[] | null | undefined,
): readonly number[] | undefined {
  if (!trend || trend.length < 2) {
    return undefined;
  }

  return trend.map((value) => Number(value));
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

function mapRateMetricCard(options: {
  title: string;
  ratesAvailable: boolean;
  value: number;
  target: number;
  trend: readonly number[] | null | undefined;
}): MetricCardProps {
  const { title, ratesAvailable, value, target, trend } = options;

  if (ratesAvailable) {
    return {
      title,
      value: formatRate(value),
      unit: "per 200k hrs",
      target,
      targetLabel: `Target ≤ ${String(target)}`,
      isMorePositive: false,
      signalOwnedBy: "target",
      icon: "mdi:chart-timeline-variant",
      trend: toSparkline(trend),
    };
  }

  return {
    title,
    value: "—",
    isMorePositive: false,
    signalOwnedBy: "target",
    icon: "mdi:chart-timeline-variant",
  };
}

/** Builds the 4 KPI cards from GET /api/EHSCommandCenter/GetMainDashboardKpis. */
export function mapDashboardKpisToMetrics(
  dto: DashboardKpisDto | null | undefined,
): readonly MetricCardProps[] {
  if (!dto) {
    return DEFAULT_DASHBOARD_KPIS;
  }

  const trirTarget = dto.trirTarget ?? FALLBACK_TRIR_TARGET;
  const ltirTarget = dto.lostTimeInjuryRateTarget ?? FALLBACK_LTIR_TARGET;
  const complianceTarget = dto.complianceTarget ?? FALLBACK_COMPLIANCE_TARGET;
  const capaTarget = dto.capaClosureTarget ?? FALLBACK_CAPA_CLOSURE_TARGET;
  const ratesAvailable = dto.ratesAvailable ?? (dto.workHoursYtd ?? 0) >= 5000;

  return [
    mapRateMetricCard({
      title: "Total Recordable Rate",
      ratesAvailable,
      value: dto.trir ?? 0,
      target: trirTarget,
      trend: dto.trirTrend,
    }),
    mapRateMetricCard({
      title: "Lost Time Injury Rate",
      ratesAvailable,
      value: dto.lostTimeInjuryRate ?? 0,
      target: ltirTarget,
      trend: dto.lostTimeInjuryRateTrend,
    }),
    {
      title: "Safety Compliance",
      value: formatPercent(dto.compliancePercentage),
      unit: "%",
      target: complianceTarget,
      targetLabel: `Target ≥ ${String(complianceTarget)}%`,
      signalOwnedBy: "target",
      icon: "mdi:shield-check-outline",
    },
    {
      title: "Action Closure Rate",
      value: formatPercent(dto.capaClosurePercentage),
      unit: "%",
      target: capaTarget,
      targetLabel: `Target ≥ ${String(capaTarget)}%`,
      signalOwnedBy: "target",
      icon: "mdi:check-circle-outline",
    },
  ];
}
