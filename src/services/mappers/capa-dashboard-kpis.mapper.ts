import type { MetricCardProps } from "@/components/ui/MetricCard";
import type {
  CapaDashboardKpiCardDto,
  CapaDashboardKpiChangeDto,
  CapaDashboardKpisDto,
  CapaDashboardKpiStatusDto,
} from "@/dtos/res/capa-dashboard-kpis-response.dto";

type MetricPreference = "lower-better" | "higher-better";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => asNumber(entry))
    .filter((entry): entry is number => entry != null);
}

function normalizeChange(raw: unknown): CapaDashboardKpiChangeDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const directionRaw = asString(
    readProp(raw, "direction", "Direction"),
  )?.toLowerCase();
  const direction =
    directionRaw === "up" || directionRaw === "down" ? directionRaw : null;

  return {
    value: asNumber(readProp(raw, "value", "Value")),
    direction,
    label: asString(readProp(raw, "label", "Label")),
  };
}

function normalizeStatus(value: unknown): CapaDashboardKpiStatusDto {
  const status = asString(value);
  if (status === "OnTarget" || status === "OffTarget") {
    return status;
  }
  return status;
}

function normalizeKpiCard(raw: unknown): CapaDashboardKpiCardDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    value: asNumber(readProp(raw, "value", "Value")),
    unit: asString(readProp(raw, "unit", "Unit")),
    target: asNumber(readProp(raw, "target", "Target")),
    status: normalizeStatus(readProp(raw, "status", "Status")),
    trend: asNumberArray(readProp(raw, "trend", "Trend")),
    trendDelta: asNumber(readProp(raw, "trendDelta", "TrendDelta")),
    change: normalizeChange(readProp(raw, "change", "Change")),
  };
}

/** Normalize GET /api/v1/capas/dashboard-kpis `dataModel`. */
export function normalizeCapaDashboardKpisDto(
  raw: unknown,
): CapaDashboardKpisDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    openCapas: normalizeKpiCard(readProp(raw, "openCapas", "OpenCapas")),
    overdueCapas: normalizeKpiCard(
      readProp(raw, "overdueCapas", "OverdueCapas"),
    ),
    onTimeClosurePercentage: normalizeKpiCard(
      readProp(raw, "onTimeClosurePercentage", "OnTimeClosurePercentage"),
    ),
    averageDaysToClose: normalizeKpiCard(
      readProp(raw, "averageDaysToClose", "AverageDaysToClose"),
    ),
  };
}

function displayUnit(unit: string | null | undefined): string {
  const normalized = unit?.trim().toLowerCase() ?? "";
  if (normalized === "capas" || normalized === "") {
    return "";
  }
  if (normalized === "days" || normalized === "day") {
    return "d";
  }
  if (normalized === "%" || normalized === "percent" || normalized === "pp") {
    return "%";
  }
  return unit?.trim() ?? "";
}

function formatValue(
  value: number | null | undefined,
  style: "int" | "oneDecimal",
): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  if (style === "oneDecimal") {
    return value.toFixed(1);
  }
  return String(Math.round(value));
}

function toSparkline(
  trend: readonly number[] | null | undefined,
): readonly number[] | undefined {
  if (!trend || trend.length < 2) {
    return undefined;
  }
  return trend.map((entry) => Number(entry));
}

function buildTargetLabel(
  target: number | null | undefined,
  preference: MetricPreference,
  unitSuffix: string,
): string | undefined {
  if (target == null || !Number.isFinite(target)) {
    return undefined;
  }

  const formatted =
    Number.isInteger(target) || Math.abs(target - Math.round(target)) < 0.05
      ? String(Math.round(target))
      : target.toFixed(1);
  const comparator = preference === "higher-better" ? "≥" : "≤";
  return `Target ${comparator} ${formatted}${unitSuffix}`;
}

/**
 * One tile, or null when the API sent no usable value for it.
 *
 * Nothing is invented here. Every field used to fall back to a Figma constant, so a card the
 * API had no number for still drew one, and a target the site had never set still read
 * "Target <= 8" - on every screen, not only when the request failed. Targets live in
 * KpiTargets and the endpoint returns null until somebody sets one; that null now means the
 * tile shows no target line, which is the honest reading of "no target set".
 */
function mapCard(
  card: CapaDashboardKpiCardDto | null | undefined,
  options: Readonly<{
    title: string;
    preference: MetricPreference;
    valueStyle: "int" | "oneDecimal";
    targetUnitSuffix: string;
  }>,
): MetricCardProps | null {
  if (!card || card.value == null || !Number.isFinite(card.value)) {
    return null;
  }

  const targetLabel = buildTargetLabel(
    card.target,
    options.preference,
    options.targetUnitSuffix,
  );

  const base = {
    title: options.title,
    value: formatValue(card.value, options.valueStyle),
    unit: displayUnit(card.unit) || "",
    target: card.target ?? undefined,
    isMorePositive: options.preference === "higher-better",
    signalOwnedBy: "target" as const,
    trend: toSparkline(card.trend),
  };

  // targetLabel is spread in rather than set to undefined: MetricCardProps makes the footer a
  // union, so an explicit undefined target label is not the same as having no target line.
  return targetLabel ? { ...base, targetLabel } : base;
}

/** Maps GET /api/v1/capas/dashboard-kpis into the four CAPA dashboard KPI cards. */
export function mapCapaDashboardKpisToMetrics(
  dto: CapaDashboardKpisDto | null | undefined,
): readonly MetricCardProps[] {
  // No dto means no tiles. The caller renders nothing rather than four invented numbers.
  if (!dto) {
    return [];
  }

  return [
    mapCard(dto.openCapas, {
      title: "Open CAPAs",
      preference: "lower-better",
      valueStyle: "int",
      targetUnitSuffix: "",
    }),
    mapCard(dto.overdueCapas, {
      title: "Overdue",
      preference: "lower-better",
      valueStyle: "int",
      targetUnitSuffix: "",
    }),
    mapCard(dto.onTimeClosurePercentage, {
      title: "On-time Closure",
      preference: "higher-better",
      valueStyle: "int",
      targetUnitSuffix: "%",
    }),
    mapCard(dto.averageDaysToClose, {
      title: "Avg Days to Close",
      preference: "lower-better",
      valueStyle: "oneDecimal",
      targetUnitSuffix: "d",
    }),
  ].filter((card): card is MetricCardProps => card !== null);
}
