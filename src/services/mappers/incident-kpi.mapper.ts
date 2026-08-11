import type {
  HeaderKpiDto,
  IncidentKpiCardDto,
  IncidentKpiStatusDto,
  IncidentListKpiDto,
  KpiMetricKey,
  KpiTargetDto,
  KpiTargetsLookup,
  SiteWorkHoursDto,
} from "@/dtos/res/incident-kpi-response.dto";
import type {
  HeroKpiMetric,
  TargetStatus,
} from "@/components/incidents/dashboard/incident-kpis-data";
import type { IncidentListKpiMetric } from "@/components/incidents/list/incident-list-types";

const HEADER_KPI_DEFINITIONS = [
  {
    key: "rir",
    id: "rir",
    title: "RIR",
    subtitle: "Recordable Incident Rate",
  },
  {
    key: "ltir",
    id: "ltir",
    title: "LTIR",
    subtitle: "Lost Time Incident Rate",
  },
  {
    key: "mttc",
    id: "mttc",
    title: "MTTC",
    subtitle: "Mean Time to Close",
  },
] as const;

type HeaderKpiKey = (typeof HEADER_KPI_DEFINITIONS)[number]["key"];

const LIST_KPI_DEFINITIONS = [
  {
    key: "openIncidents",
    id: "open-incidents",
    title: "Open Incidents",
    direction: "lower-better",
    valueFormat: "integer",
  },
  {
    key: "mttc",
    id: "mean-time-to-close",
    title: "Mean Time to Close",
    direction: "lower-better",
    valueFormat: "decimal",
  },
  {
    key: "rir",
    id: "recordable-rate",
    title: "Recordable Rate",
    direction: "lower-better",
    valueFormat: "decimal",
  },
  {
    key: "daysWithoutLti",
    id: "days-without-lti",
    title: "Days Without LTI",
    direction: "higher-better",
    valueFormat: "integer",
  },
] as const;

type ListKpiKey = (typeof LIST_KPI_DEFINITIONS)[number]["key"];
type MetricDirection = "lower-better" | "higher-better";
type ValueFormat = "integer" | "decimal";

/** Backend swagger has shown `mttr` — normalize to `mttc`. */
const KPI_METRIC_ALIASES: Partial<Record<string, KpiMetricKey>> = {
  mttr: "mttc",
};

function isKpiMetricKey(value: string): value is KpiMetricKey {
  return (
    value === "rir" ||
    value === "ltir" ||
    value === "mttc" ||
    value === "openIncidents" ||
    value === "daysWithoutLti"
  );
}

/** Normalizes API metric strings (case-insensitive) to known card keys. */
export function normalizeKpiMetricKey(metric: string): KpiMetricKey | null {
  const normalized = metric.trim().toLowerCase();
  const resolved = KPI_METRIC_ALIASES[normalized] ?? normalized;
  return isKpiMetricKey(resolved) ? resolved : null;
}

/** Builds a lookup table from GET /api/Incident/kpi-targets. */
export function mapKpiTargetsToLookup(
  targets: readonly KpiTargetDto[] | null | undefined,
): KpiTargetsLookup {
  const lookup: KpiTargetsLookup = {};

  for (const item of targets ?? []) {
    const key = normalizeKpiMetricKey(item.metric);
    if (key != null && Number.isFinite(item.targetValue)) {
      lookup[key] = item.targetValue;
    }
  }

  return lookup;
}

function computeKpiStatus(
  value: number,
  target: number,
  direction: MetricDirection,
): IncidentKpiStatusDto {
  if (direction === "lower-better") {
    return value <= target ? "OnTarget" : "OffTarget";
  }

  return value >= target ? "OnTarget" : "OffTarget";
}

function enrichKpiCard(
  card: IncidentKpiCardDto | undefined,
  metricKey: KpiMetricKey,
  lookup: KpiTargetsLookup | undefined,
  direction: MetricDirection,
): IncidentKpiCardDto | undefined {
  if (!card || card.target != null || !lookup) {
    return card;
  }

  const target = lookup[metricKey];
  if (target == null) {
    return card;
  }

  return {
    ...card,
    target,
    status: card.status ?? computeKpiStatus(card.value, target, direction),
  };
}

function formatMetricValue(
  value: number,
  format: ValueFormat = "decimal",
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (format === "integer") {
    return String(Math.round(value));
  }

  const fixed = value.toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

function buildListTargetLabel(
  target: number | null,
  unit: string,
  direction: MetricDirection,
  valueFormat: ValueFormat,
): string | null {
  if (target == null || !Number.isFinite(target)) {
    return null;
  }

  const formattedTarget = formatMetricValue(target, valueFormat);
  const comparator = direction === "lower-better" ? "≤" : "≥";
  return `Target ${comparator} ${formattedTarget}${unit ? ` · ${unit}` : ""}`;
}

function mapApiStatus(status: IncidentKpiStatusDto): TargetStatus | null {
  if (status === "OnTarget") {
    return "on";
  }
  if (status === "OffTarget") {
    return "off";
  }
  return null;
}

function buildTargetLabel(target: number | null, unit: string): string | null {
  if (target == null || !Number.isFinite(target)) {
    return null;
  }

  return `Target ${formatMetricValue(target)} · ${unit}`;
}

/**
 * MTTC weeks with zero closures should not read as "0 days average".
 * Keep the sparkline when at least two non-zero points exist; otherwise
 * fall back to the raw trend so the card still renders a flat line.
 */
function toMttcChartData(trend: readonly number[]): readonly number[] {
  const nonZeroPoints = trend.filter((value) => value > 0);
  return nonZeroPoints.length >= 2 ? nonZeroPoints : trend;
}

function toChartData(
  trend: readonly number[],
  metricKey: HeaderKpiKey,
): readonly number[] {
  if (metricKey !== "mttc") {
    return trend;
  }

  return toMttcChartData(trend);
}

function toListChartData(
  trend: readonly number[],
  metricKey: ListKpiKey,
): readonly number[] {
  if (metricKey === "mttc") {
    return toMttcChartData(trend);
  }

  return trend;
}

function mapKpiCardToHeroMetric(
  definition: (typeof HEADER_KPI_DEFINITIONS)[number],
  card: IncidentKpiCardDto | undefined,
  ratesAvailable: boolean,
): HeroKpiMetric {
  const isRateMetric = definition.key === "rir" || definition.key === "ltir";
  const showRate = !isRateMetric || ratesAvailable;
  const value = card?.value ?? 0;
  const target = card?.target ?? null;
  const unit = showRate ? card?.unit?.trim() || undefined : undefined;

  return {
    id: definition.id,
    title: definition.title,
    subtitle: definition.subtitle,
    value: showRate ? formatMetricValue(value) : "—",
    unit,
    target,
    current: showRate ? value : 0,
    targetLabel: showRate
      ? buildTargetLabel(target, card?.unit ?? "")
      : "Add work hours in Settings",
    direction: "lower-better",
    chartData: showRate ? toChartData(card?.trend ?? [], definition.key) : [],
    status: showRate ? mapApiStatus(card?.status ?? null) : null,
  };
}

function mapKpiCardToListMetric(
  definition: (typeof LIST_KPI_DEFINITIONS)[number],
  card: IncidentKpiCardDto | undefined,
  ratesAvailable: boolean,
): IncidentListKpiMetric {
  const isRateMetric = definition.key === "rir";
  const showRate = !isRateMetric || ratesAvailable;
  const rawValue = card?.value ?? 0;
  const target = card?.target ?? null;
  const unit = showRate ? card?.unit?.trim() || undefined : undefined;
  const series = showRate
    ? toListChartData(card?.trend ?? [], definition.key)
    : [];

  // `trendDelta` is only a fallback: when the API sends a series, the card
  // derives the delta from it so the badge and the sparkline agree.
  const explicitDelta =
    showRate && series.length < 2 ? (card?.trendDelta ?? undefined) : undefined;

  const targetLabel = showRate
    ? buildListTargetLabel(
        target,
        card?.unit ?? "",
        definition.direction,
        definition.valueFormat,
      )
    : "Add work hours in Settings";

  return {
    id: definition.id,
    title: definition.title,
    value: showRate ? formatMetricValue(rawValue, definition.valueFormat) : "—",
    unit,
    trend: series.length >= 2 ? series : undefined,
    delta: explicitDelta ?? undefined,
    target: showRate && target != null ? target : undefined,
    isMorePositive: definition.direction === "higher-better",
    signalOwnedBy: "target",
    icon: "mdi:chart-timeline-variant",
    // "" when the metric has no configured target — the footer row then holds
    // only the sparkline.
    targetLabel: targetLabel ?? "",
  };
}

/** Maps GET /api/Incident/GetHeaderKpi into dashboard hero cards. */
export function mapHeaderKpisToHeroMetrics(
  dto: HeaderKpiDto | null | undefined,
  targetsLookup?: KpiTargetsLookup,
  ratesAvailable = true,
): readonly HeroKpiMetric[] {
  if (!dto) {
    return [];
  }

  return HEADER_KPI_DEFINITIONS.map((definition) =>
    mapKpiCardToHeroMetric(
      definition,
      enrichKpiCard(
        dto[definition.key],
        definition.key,
        targetsLookup,
        "lower-better",
      ),
      ratesAvailable,
    ),
  );
}

/** Maps GET /api/Incident/GetIncidentListKpis into list KPI cards. */
export function mapIncidentListKpisToMetrics(
  dto: IncidentListKpiDto | null | undefined,
  targetsLookup?: KpiTargetsLookup,
  ratesAvailable = true,
): readonly IncidentListKpiMetric[] {
  if (!dto) {
    return [];
  }

  return LIST_KPI_DEFINITIONS.map((definition) =>
    mapKpiCardToListMetric(
      definition,
      enrichKpiCard(
        dto[definition.key],
        definition.key,
        targetsLookup,
        definition.direction,
      ),
      ratesAvailable,
    ),
  );
}

/** Whether any stored month has hours greater than zero. */
export function hasSiteWorkHours(
  records: readonly SiteWorkHoursDto[] | null | undefined,
): boolean {
  return (records ?? []).some((record) => record.hours > 0);
}

/** Sums stored hours for a calendar year (defaults to current UTC year). */
export function sumSiteWorkHoursForYear(
  records: readonly SiteWorkHoursDto[] | null | undefined,
  year = new Date().getUTCFullYear(),
): number {
  return (records ?? [])
    .filter((record) => record.year === year)
    .reduce((total, record) => total + record.hours, 0);
}

/** YTD workforce hours must reach this before OSHA rates are meaningful. */
export const MIN_WORK_HOURS_FOR_RATES = 5000;

export function hasSufficientSiteWorkHours(
  records: readonly SiteWorkHoursDto[] | null | undefined,
  year = new Date().getUTCFullYear(),
): boolean {
  return sumSiteWorkHoursForYear(records, year) >= MIN_WORK_HOURS_FOR_RATES;
}

/** Finds the stored hours entry for a specific year/month, if present. */
