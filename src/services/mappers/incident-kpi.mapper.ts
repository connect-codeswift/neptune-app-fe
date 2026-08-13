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

/**
 * Whether YTD hours are known and large enough for OSHA rates.
 * `"loading"` must not be treated as `"unavailable"` — that flashes `—`
 * on every page load, even for a site with hours already entered.
 */
export type SiteWorkHoursAvailability =
  | "loading"
  | "error"
  | "insufficient"
  | "available";

/** Caption on a rate card when `/site-work-hours` failed. */
export const RATE_HOURS_CHECK_FAILED_LABEL = "Couldn't check work hours";

/**
 * Hours gate for RIR / LTIR. `"unavailable"` and `"check-failed"` both
 * hide the numeric rate; only `"check-failed"` gets an error caption.
 */
export type IncidentRateHoursGate =
  | "available"
  | "unavailable"
  | "check-failed";

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

  let status = card.status;
  if (status == null && card.value != null) {
    status = computeKpiStatus(card.value, target, direction);
  }

  return {
    ...card,
    target,
    status,
  };
}

function formatMetricValue(
  value: number | null,
  format: ValueFormat = "decimal",
): string {
  if (value == null || !Number.isFinite(value)) {
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

/** Drop null weeks — a null point is "no data", never a plotted zero. */
function toNumericTrend(
  trend: readonly (number | null)[] | undefined,
): number[] {
  return (trend ?? []).filter((point): point is number => point != null);
}

function mapKpiCardToHeroMetric(
  definition: (typeof HEADER_KPI_DEFINITIONS)[number],
  card: IncidentKpiCardDto | undefined,
  rateHoursGate: IncidentRateHoursGate,
): HeroKpiMetric {
  const isRateMetric = definition.key === "rir" || definition.key === "ltir";
  const showRate = !isRateMetric || rateHoursGate === "available";
  const rawValue = card?.value ?? null;
  const target = card?.target ?? null;
  const unit = showRate ? card?.unit?.trim() || undefined : undefined;

  let footerNote: string | undefined;
  if (isRateMetric && rateHoursGate === "check-failed") {
    footerNote = RATE_HOURS_CHECK_FAILED_LABEL;
  } else if (isRateMetric && rateHoursGate === "unavailable") {
    footerNote = "";
  }

  return {
    id: definition.id,
    title: definition.title,
    subtitle: definition.subtitle,
    value: showRate ? formatMetricValue(rawValue) : "—",
    unit,
    target: showRate && rawValue != null ? target : null,
    current: showRate && rawValue != null ? rawValue : 0,
    targetLabel:
      showRate && rawValue != null
        ? buildTargetLabel(target, card?.unit ?? "")
        : null,
    direction: "lower-better",
    chartData: showRate ? toNumericTrend(card?.trend) : [],
    status: showRate ? mapApiStatus(card?.status ?? null) : null,
    footerNote,
  };
}

/**
 * Days-without-LTI ticks +7 every quiet week; that badge tells the user
 * nothing. Only surface it the week the streak resets (a negative delta).
 * `null` (not `undefined`) is authoritative "no badge" so MetricCard will
 * not fall back to first-to-last of the sparkline.
 */
function listCardDelta(
  showRate: boolean,
  metricKey: ListKpiKey,
  trendDelta: number | null | undefined,
): number | null | undefined {
  if (!showRate) {
    return undefined;
  }

  if (
    metricKey === "daysWithoutLti" &&
    (trendDelta == null || trendDelta >= 0)
  ) {
    return null;
  }

  return trendDelta ?? null;
}

function mapKpiCardToListMetric(
  definition: (typeof LIST_KPI_DEFINITIONS)[number],
  card: IncidentKpiCardDto | undefined,
  rateHoursGate: IncidentRateHoursGate,
): IncidentListKpiMetric {
  const isRateMetric = definition.key === "rir";
  const showRate = !isRateMetric || rateHoursGate === "available";
  const rawValue = card?.value ?? null;
  const target = card?.target ?? null;
  const hasNoLtiRecorded =
    definition.key === "daysWithoutLti" && rawValue == null;
  const unit =
    showRate && !hasNoLtiRecorded
      ? card?.unit?.trim() || undefined
      : undefined;
  const series = showRate ? toNumericTrend(card?.trend) : [];

  // The backend computes this week-over-week. Never derive it from the series
  // here: daysWithoutLti resets on every LTI, so first-to-last reports an
  // improvement for a window in which someone was injured.
  // See FEGuides/IncidentKpiMigration.md.
  const explicitDelta = listCardDelta(
    showRate,
    definition.key,
    card?.trendDelta,
  );
  const deltaWeeks =
    showRate && explicitDelta != null
      ? (card?.trendDeltaWeeks ?? undefined)
      : undefined;

  let displayValue = "—";
  if (hasNoLtiRecorded) {
    displayValue = "No LTI recorded";
  } else if (showRate) {
    displayValue = formatMetricValue(rawValue, definition.valueFormat);
  }

  const targetLabel = showRate
    ? buildListTargetLabel(
        target,
        card?.unit ?? "",
        definition.direction,
        definition.valueFormat,
      )
    : "";

  const rateHoursFailed =
    isRateMetric && rateHoursGate === "check-failed";

  const metric = {
    id: definition.id,
    title: definition.title,
    value: displayValue,
    unit,
    trend: series.length >= 2 ? series : undefined,
    delta: explicitDelta,
    deltaWeeks,
    target: showRate && target != null ? target : undefined,
    isMorePositive: definition.direction === "higher-better",
    signalOwnedBy: "target" as const,
    icon: "mdi:chart-timeline-variant",
  };

  if (rateHoursFailed) {
    return {
      ...metric,
      description: RATE_HOURS_CHECK_FAILED_LABEL,
    };
  }

  return {
    ...metric,
    // "" when the metric has no configured target — the footer row then holds
    // only the sparkline.
    targetLabel: targetLabel ?? "",
  };
}

/** Maps GET /api/Incident/GetHeaderKpi into dashboard hero cards. */
export function mapHeaderKpisToHeroMetrics(
  dto: HeaderKpiDto | null | undefined,
  targetsLookup?: KpiTargetsLookup,
  rateHoursGate: IncidentRateHoursGate = "available",
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
      rateHoursGate,
    ),
  );
}

/** Maps GET /api/Incident/GetIncidentListKpis into list KPI cards. */
export function mapIncidentListKpisToMetrics(
  dto: IncidentListKpiDto | null | undefined,
  targetsLookup?: KpiTargetsLookup,
  rateHoursGate: IncidentRateHoursGate = "available",
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
      rateHoursGate,
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

/**
 * Distinguishes "hours request in flight" from "no hours entered" from
 * "the hours request failed". Passing `undefined` records into
 * `hasSufficientSiteWorkHours` used to collapse the first two into `false`.
 */
export function resolveSiteWorkHoursAvailability(args: {
  isLoading: boolean;
  isError: boolean;
  records: readonly SiteWorkHoursDto[] | null | undefined;
}): SiteWorkHoursAvailability {
  if (args.isLoading) {
    return "loading";
  }

  if (args.isError && args.records == null) {
    return "error";
  }

  return hasSufficientSiteWorkHours(args.records)
    ? "available"
    : "insufficient";
}

export function toIncidentRateHoursGate(
  availability: SiteWorkHoursAvailability,
): IncidentRateHoursGate {
  if (availability === "available") {
    return "available";
  }

  if (availability === "error") {
    return "check-failed";
  }

  return "unavailable";
}
