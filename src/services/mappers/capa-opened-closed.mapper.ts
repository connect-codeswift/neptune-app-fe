import type { CapaTrendPoint } from "@/components/capa/capa-dashboard-data";
import type {
  CapaOpenedClosedDto,
  CapaOpenedClosedWeekDto,
} from "@/dtos/res/capa-opened-closed-response.dto";

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

function asCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }
  return 0;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function normalizeWeek(raw: unknown): CapaOpenedClosedWeekDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const week = asString(readProp(raw, "week", "Week"));
  if (!week) {
    return null;
  }

  return {
    week,
    weekStart: asString(readProp(raw, "weekStart", "WeekStart")),
    opened: asCount(readProp(raw, "opened", "Opened")),
    closed: asCount(readProp(raw, "closed", "Closed")),
  };
}

/** Normalize GET /api/v1/capas/opened-vs-closed `dataModel`. */
export function normalizeCapaOpenedClosedDto(
  raw: unknown,
): CapaOpenedClosedDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const weeksRaw = readProp(raw, "weeks", "Weeks");
  const weeks = Array.isArray(weeksRaw)
    ? weeksRaw
        .map((entry) => normalizeWeek(entry))
        .filter((entry): entry is CapaOpenedClosedWeekDto => entry != null)
    : [];

  return {
    totalOpened: asCount(readProp(raw, "totalOpened", "TotalOpened")),
    totalClosed: asCount(readProp(raw, "totalClosed", "TotalClosed")),
    weeks,
  };
}

export type CapaOpenedClosedViewModel = Readonly<{
  points: readonly CapaTrendPoint[];
  totalOpened: number;
  totalClosed: number;
  weekCount: number;
  closingFaster: boolean;
}>;

function toTrendPoints(
  weeks: readonly CapaOpenedClosedWeekDto[],
): CapaTrendPoint[] {
  return weeks.map((week) => ({
    week: week.week ?? "—",
    opened: week.opened ?? 0,
    closed: week.closed ?? 0,
  }));
}

function isClosingFaster(points: readonly CapaTrendPoint[]): boolean {
  if (points.length === 0) {
    return false;
  }

  const recent = points.slice(-Math.min(4, points.length));
  const opened = recent.reduce((sum, point) => sum + point.opened, 0);
  const closed = recent.reduce((sum, point) => sum + point.closed, 0);

  return closed >= opened * 0.5;
}

/** Maps GET /api/v1/capas/opened-vs-closed into chart points + summary. */
export function mapCapaOpenedClosedToView(
  dto: CapaOpenedClosedDto | null | undefined,
): CapaOpenedClosedViewModel {
  if (!dto || !dto.weeks || dto.weeks.length === 0) {
    // Empty, not the Figma trend. The card printed "Unable to load trend" and drew the
    // placeholder curve underneath it, which is the most confidently wrong state of the three.
    return {
      points: [],
      totalOpened: 0,
      totalClosed: 0,
      weekCount: 0,
      closingFaster: false,
    };
  }

  const points = toTrendPoints(dto.weeks);
  const totalOpened =
    dto.totalOpened != null && Number.isFinite(dto.totalOpened)
      ? dto.totalOpened
      : points.reduce((sum, point) => sum + point.opened, 0);
  const totalClosed =
    dto.totalClosed != null && Number.isFinite(dto.totalClosed)
      ? dto.totalClosed
      : points.reduce((sum, point) => sum + point.closed, 0);

  return {
    points,
    totalOpened,
    totalClosed,
    weekCount: points.length,
    closingFaster: isClosingFaster(points),
  };
}
