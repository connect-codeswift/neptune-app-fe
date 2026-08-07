import type {
  IncidentDashboardKpisDto,
  IncidentDashboardTargetsDto,
  KpiTargetDto,
  RecordablesBySiteDto,
  RecordablesMonthlyDto,
  RecordableMixDto,
} from "@/dtos/res/incident-kpi-response.dto";
import type {
  IndicatorMetric,
  SiteRecordable,
  TargetDirection,
} from "@/components/incidents/dashboard/incident-kpis-data";
import { normalizeKpiMetricKey } from "@/services/mappers/incident-kpi.mapper";

export type InjuryMixItem = Readonly<{
  label: string;
  value: number;
  color: string;
}>;

export type RecordableChartViewModel = Readonly<{
  months: readonly string[];
  series: readonly number[];
  target: number | null;
  yMax: number;
}>;

export type IncidentDashboardViewModel = Readonly<{
  indicators: readonly IndicatorMetric[];
  recordablesBySite: readonly SiteRecordable[];
  recordableChart: RecordableChartViewModel;
  injuryMix: readonly InjuryMixItem[];
  injuryMixTotal: number;
}>;

type IndicatorDefinition = Readonly<{
  id: string;
  title: string;
  countKey?: keyof IncidentDashboardKpisDto;
  targetKey?: string;
  hasIndicator: boolean;
  direction?: TargetDirection;
  footnote?: string;
  titleDot?: string;
  titleLines?: readonly [string, string];
}>;

const INJURY_MIX_COLORS = {
  fatality: "var(--ehs-red)",
  restricted: "var(--ehs-yellow)",
  lostTime: "var(--ehs-normal-blue)",
  medicalOnly: "var(--ehs-green)",
} as const;

const INDICATOR_DEFINITIONS: readonly IndicatorDefinition[] = [
  {
    id: "total-recordable",
    title: "Total Recordable Injuries",
    countKey: "totalRecordable",
    targetKey: "totalRecordable",
    hasIndicator: true,
    direction: "lower-better",
    footnote: "Drives RIR",
  },
  {
    id: "lost-time",
    title: "Lost Time Count",
    countKey: "lostTimeCount",
    targetKey: "lostTimeCount",
    hasIndicator: true,
    direction: "lower-better",
  },
  {
    id: "restricted-work",
    title: "Restricted Work Count",
    countKey: "restrictedWorkCount",
    targetKey: "restrictedWorkCount",
    hasIndicator: true,
    direction: "lower-better",
  },
  {
    id: "medical-only",
    title: "Medical Only Count",
    countKey: "medicalOnlyCount",
    targetKey: "medicalOnlyCount",
    hasIndicator: true,
    direction: "lower-better",
    footnote: "Beyond first aid",
  },
  {
    id: "first-aid",
    title: "First Aid Count",
    countKey: "firstAidCount",
    hasIndicator: false,
    footnote: "Leading indicator · no target",
  },
  {
    id: "fatality",
    title: "Fatality Count",
    countKey: "fatalityCount",
    targetKey: "fatalityCount",
    hasIndicator: true,
    direction: "lower-better",
  },
  {
    id: "lost-days",
    title: "Lost Days",
    countKey: "lostDays",
    targetKey: "lostDays",
    hasIndicator: true,
    direction: "lower-better",
  },
  {
    id: "restricted-days",
    title: "Restricted Days",
    countKey: "restrictedDays",
    targetKey: "restrictedDays",
    hasIndicator: true,
    direction: "lower-better",
  },
  {
    id: "sia",
    title: "SIA Count",
    countKey: "siaCount",
    targetKey: "siaCount",
    hasIndicator: true,
    direction: "lower-better",
    titleDot: "var(--ehs-red)",
  },
  {
    id: "sip",
    title: "SIP Count",
    countKey: "sipCount",
    hasIndicator: false,
    footnote: "Leading indicator · no target",
    titleDot: "var(--ehs-gray)",
  },
  {
    id: "near-miss",
    title: "Near Miss Count",
    targetKey: "nearMissCount",
    hasIndicator: true,
    direction: "higher-better",
  },
  {
    id: "hazard-id",
    title: "Hazard ID Count",
    targetKey: "hazardIdCount",
    hasIndicator: true,
    direction: "higher-better",
  },
];

export const FEATURED_INDICATOR_IDS = [
  "sia",
  "sip",
  "hazard-id",
  "near-miss",
] as const;

const TARGET_KEY_ALIASES: Partial<Record<string, string>> = {
  mttr: "mttc",
  monthlyrecordables: "monthlyRecordables",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function normalizeTargetKey(key: string): string {
  const trimmed = key.trim();
  const alias = TARGET_KEY_ALIASES[trimmed.toLowerCase()];
  return alias ?? trimmed;
}

function formatInteger(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function buildTargetLabel(target: number | null): string | null {
  if (target == null || !Number.isFinite(target)) {
    return null;
  }

  return `Target ${formatInteger(target)}`;
}

function buildTargetsLookup(
  dashboardTargets: IncidentDashboardTargetsDto | null | undefined,
  kpiTargets: readonly KpiTargetDto[] | null | undefined,
): Record<string, number> {
  const lookup: Record<string, number> = {};

  if (dashboardTargets) {
    for (const [rawKey, rawValue] of Object.entries(dashboardTargets)) {
      const key = normalizeTargetKey(rawKey);
      const value = asNumber(rawValue);
      if (!key || key === "string" || value == null) {
        continue;
      }
      lookup[key] = value;
    }
  }

  for (const item of kpiTargets ?? []) {
    const normalizedMetric = normalizeKpiMetricKey(item.metric);
    const key = normalizedMetric ?? normalizeTargetKey(item.metric);
    if (Number.isFinite(item.targetValue)) {
      lookup[key] = item.targetValue;
    }
  }

  return lookup;
}

function resolveTarget(
  targetKey: string | undefined,
  lookup: Record<string, number>,
): number | null {
  if (!targetKey) {
    return null;
  }

  const normalized = normalizeTargetKey(targetKey);
  const value = lookup[normalized] ?? lookup[targetKey];
  return value == null ? null : value;
}

function readCount(
  dto: IncidentDashboardKpisDto,
  key: keyof IncidentDashboardKpisDto | undefined,
): number | null {
  if (!key) {
    return null;
  }

  const value = dto[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapIndicatorMetric(
  definition: IndicatorDefinition,
  dto: IncidentDashboardKpisDto,
  lookup: Record<string, number>,
): IndicatorMetric {
  const current = readCount(dto, definition.countKey);
  const target = definition.hasIndicator
    ? resolveTarget(definition.targetKey, lookup)
    : null;

  return {
    id: definition.id,
    title: definition.title,
    titleLines: definition.titleLines,
    titleDot: definition.titleDot,
    footnote: definition.footnote,
    hasIndicator: definition.hasIndicator,
    direction: definition.direction,
    value: formatInteger(current),
    current: current ?? undefined,
    target: target ?? undefined,
    targetLabel: buildTargetLabel(target) ?? undefined,
  };
}

function normalizeRecordablesBySite(
  raw: readonly unknown[] | null | undefined,
): readonly RecordablesBySiteDto[] {
  if (!raw?.length) {
    return [];
  }

  return raw.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const site = asString(item.site ?? item.Site)?.trim();
    const count = asNumber(item.count ?? item.Count);
    if (!site || count == null) {
      return [];
    }

    return [{ site, count }];
  });
}

function normalizeRecordablesMonthly(
  raw: readonly unknown[] | null | undefined,
): readonly RecordablesMonthlyDto[] {
  if (!raw?.length) {
    return [];
  }

  return raw.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const year = asNumber(item.year ?? item.Year);
    const month = asNumber(item.month ?? item.Month);
    const label = asString(item.label ?? item.Label)?.trim();
    const count = asNumber(item.count ?? item.Count);
    if (year == null || month == null || !label || count == null) {
      return [];
    }

    return [{ year, month, label, count }];
  });
}

function normalizeRecordableMix(raw: unknown): RecordableMixDto {
  if (!isRecord(raw)) {
    return {
      lostTime: 0,
      restricted: 0,
      medicalOnly: 0,
      firstAid: 0,
    };
  }

  return {
    lostTime: asNumber(raw.lostTime ?? raw.LostTime) ?? 0,
    restricted: asNumber(raw.restricted ?? raw.Restricted) ?? 0,
    medicalOnly: asNumber(raw.medicalOnly ?? raw.MedicalOnly) ?? 0,
    firstAid: asNumber(raw.firstAid ?? raw.FirstAid) ?? 0,
  };
}

export function normalizeIncidentDashboardKpisDto(
  raw: unknown,
): IncidentDashboardKpisDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const recordablesBySite = normalizeRecordablesBySite(
    Array.isArray(raw.recordablesBySite)
      ? raw.recordablesBySite
      : Array.isArray(raw.RecordablesBySite)
        ? raw.RecordablesBySite
        : [],
  );

  const recordablesMonthly = normalizeRecordablesMonthly(
    Array.isArray(raw.recordablesMonthly)
      ? raw.recordablesMonthly
      : Array.isArray(raw.RecordablesMonthly)
        ? raw.RecordablesMonthly
        : [],
  );

  const targetsRaw = isRecord(raw.targets ?? raw.Targets)
    ? ((raw.targets ?? raw.Targets) as Record<string, unknown>)
    : {};

  const targets: IncidentDashboardTargetsDto = {};
  for (const [key, value] of Object.entries(targetsRaw)) {
    const parsed = asNumber(value);
    if (parsed != null) {
      targets[key] = parsed;
    }
  }

  return {
    totalRecordable: asNumber(raw.totalRecordable ?? raw.TotalRecordable) ?? 0,
    lostTimeCount: asNumber(raw.lostTimeCount ?? raw.LostTimeCount) ?? 0,
    restrictedWorkCount:
      asNumber(raw.restrictedWorkCount ?? raw.RestrictedWorkCount) ?? 0,
    medicalOnlyCount: asNumber(raw.medicalOnlyCount ?? raw.MedicalOnlyCount) ?? 0,
    firstAidCount: asNumber(raw.firstAidCount ?? raw.FirstAidCount) ?? 0,
    fatalityCount: asNumber(raw.fatalityCount ?? raw.FatalityCount) ?? 0,
    lostDays: asNumber(raw.lostDays ?? raw.LostDays) ?? 0,
    restrictedDays: asNumber(raw.restrictedDays ?? raw.RestrictedDays) ?? 0,
    siaCount: asNumber(raw.siaCount ?? raw.SiaCount) ?? 0,
    sipCount: asNumber(raw.sipCount ?? raw.SipCount) ?? 0,
    recordablesBySite,
    recordablesMonthly,
    recordableMix: normalizeRecordableMix(raw.recordableMix ?? raw.RecordableMix),
    targets,
  };
}

function computeChartYMax(series: readonly number[], target: number | null): number {
  const peak = Math.max(...series, target ?? 0, 1);
  if (peak <= 6) {
    return 6;
  }

  return Math.ceil(peak * 1.15);
}

function mapRecordableChart(
  monthly: readonly RecordablesMonthlyDto[],
  lookup: Record<string, number>,
): RecordableChartViewModel {
  const months = monthly.map((item) => item.label);
  const series = monthly.map((item) => item.count);
  const target =
    resolveTarget("monthlyRecordables", lookup) ??
    resolveTarget("recordablesMonthly", lookup);

  return {
    months,
    series,
    target,
    yMax: computeChartYMax(series, target),
  };
}

function mapInjuryMix(
  dto: IncidentDashboardKpisDto,
): readonly InjuryMixItem[] {
  return [
    {
      label: "Fatality",
      value: dto.fatalityCount,
      color: INJURY_MIX_COLORS.fatality,
    },
    {
      label: "Restricted Work",
      value: dto.recordableMix.restricted,
      color: INJURY_MIX_COLORS.restricted,
    },
    {
      label: "Lost Time",
      value: dto.recordableMix.lostTime,
      color: INJURY_MIX_COLORS.lostTime,
    },
    {
      label: "Medical Only",
      value: dto.recordableMix.medicalOnly,
      color: INJURY_MIX_COLORS.medicalOnly,
    },
  ];
}

/** Maps GET /api/Incident/dashboard-kpis into dashboard section view models. */
export function mapIncidentDashboardKpisToViewModel(
  dto: IncidentDashboardKpisDto | null | undefined,
  kpiTargets: readonly KpiTargetDto[] | null | undefined,
): IncidentDashboardViewModel {
  if (!dto) {
    return {
      indicators: INDICATOR_DEFINITIONS.map((definition) => ({
        id: definition.id,
        title: definition.title,
        titleLines: definition.titleLines,
        titleDot: definition.titleDot,
        footnote: definition.footnote,
        hasIndicator: definition.hasIndicator,
        direction: definition.direction,
        value: "—",
      })),
      recordablesBySite: [],
      recordableChart: {
        months: [],
        series: [],
        target: null,
        yMax: 6,
      },
      injuryMix: mapInjuryMix({
        totalRecordable: 0,
        lostTimeCount: 0,
        restrictedWorkCount: 0,
        medicalOnlyCount: 0,
        firstAidCount: 0,
        fatalityCount: 0,
        lostDays: 0,
        restrictedDays: 0,
        siaCount: 0,
        sipCount: 0,
        recordablesBySite: [],
        recordablesMonthly: [],
        recordableMix: {
          lostTime: 0,
          restricted: 0,
          medicalOnly: 0,
          firstAid: 0,
        },
        targets: {},
      }),
      injuryMixTotal: 0,
    };
  }

  const lookup = buildTargetsLookup(dto.targets, kpiTargets);

  return {
    indicators: INDICATOR_DEFINITIONS.map((definition) =>
      mapIndicatorMetric(definition, dto, lookup),
    ),
    recordablesBySite: dto.recordablesBySite.map((item) => ({
      site: item.site,
      count: item.count,
    })),
    recordableChart: mapRecordableChart(dto.recordablesMonthly, lookup),
    injuryMix: mapInjuryMix(dto),
    injuryMixTotal: dto.totalRecordable,
  };
}

export function partitionIndicatorMetrics(
  indicators: readonly IndicatorMetric[],
): Readonly<{
  gridIndicators: readonly IndicatorMetric[];
  featuredIndicators: readonly IndicatorMetric[];
}> {
  const featuredSet = new Set<string>(FEATURED_INDICATOR_IDS);

  return {
    gridIndicators: indicators.filter((metric) => !featuredSet.has(metric.id)),
    featuredIndicators: FEATURED_INDICATOR_IDS.flatMap((id) => {
      const metric = indicators.find((item) => item.id === id);
      return metric ? [metric] : [];
    }),
  };
}
