import type { SaveSiteWorkWeekRequestDto } from "@/dtos/req/site-work-week-request.dto";
import type {
  GetRecentSiteWorkWeeksResponseDto,
  GetSiteWorkWeekResponseDto,
  RecentSiteWorkWeekDto,
  SaveSiteWorkWeekResponseDto,
  SiteWorkWeekDto,
  SiteWorkWeekShiftDto,
} from "@/dtos/res/site-work-week-response.dto";
import http from "@/lib/axios";

// `/api` and `/v1` are prepended by withApiVersion in axios.ts, so path constants carry neither.
const SITE_WORK_WEEKS_PATH = "/sites/work-weeks";
const SITE_WORK_WEEKS_RECENT_PATH = "/sites/work-weeks/recent";

const MIN_RECENT_WEEKS = 1;
const MAX_RECENT_WEEKS = 52;

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

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

/**
 * Trim a wire time to "HH:mm".
 *
 * The backend stores a TimeSpan, which serializes as "06:00:00" — the seconds would be
 * rejected by `<input type="time">` and echoed back on save.
 */
function asClockTime(value: unknown): string | undefined {
  const raw = asString(value)?.trim();
  if (!raw) {
    return undefined;
  }

  const match = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!match) {
    return undefined;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return undefined;
  }

  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

function coerceShift(raw: unknown): SiteWorkWeekShiftDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const startTime = asClockTime(readProp(raw, "startTime", "StartTime"));
  const endTime = asClockTime(readProp(raw, "endTime", "EndTime"));
  const headcount = asNumber(readProp(raw, "headcount", "Headcount"));

  if (!startTime || !endTime || headcount == null) {
    return null;
  }

  return {
    title: asString(readProp(raw, "title", "Title"))?.trim() ?? "",
    startTime,
    endTime,
    headcount,
  };
}

/** ISO weekdays only, de-duplicated and ordered Monday-first. */
function coerceWorkingDays(raw: unknown): readonly number[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const days = new Set<number>();
  for (const entry of raw) {
    const day = asNumber(entry);
    if (day != null && Number.isInteger(day) && day >= 1 && day <= 7) {
      days.add(day);
    }
  }

  return [...days].sort((left, right) => left - right);
}

function coerceWorkWeek(raw: unknown): SiteWorkWeekDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const weekStartDate = asString(
    readProp(raw, "weekStartDate", "WeekStartDate"),
  )?.trim();

  if (!weekStartDate) {
    return null;
  }

  const shiftsRaw = readProp(raw, "shifts", "Shifts");

  return {
    // A draft week has no row of its own, so id 0 is expected rather than missing data.
    id: asNumber(readProp(raw, "id", "Id")) ?? 0,
    weekStartDate,
    workingDays: coerceWorkingDays(readProp(raw, "workingDays", "WorkingDays")),
    shifts: Array.isArray(shiftsRaw)
      ? shiftsRaw
          .map(coerceShift)
          .filter((shift): shift is SiteWorkWeekShiftDto => shift != null)
      : [],
    dailyHours: asNumber(readProp(raw, "dailyHours", "DailyHours")) ?? 0,
    weekHours: asNumber(readProp(raw, "weekHours", "WeekHours")) ?? 0,
    headcount: asNumber(readProp(raw, "headcount", "Headcount")) ?? 0,
    isDraft: asBoolean(readProp(raw, "isDraft", "IsDraft")) ?? false,
    updatedAt:
      asString(readProp(raw, "updatedAt", "UpdatedAt"))?.trim() ?? null,
  };
}

function coerceRecentWeek(raw: unknown): RecentSiteWorkWeekDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const weekStartDate = asString(
    readProp(raw, "weekStartDate", "WeekStartDate"),
  )?.trim();

  if (!weekStartDate) {
    return null;
  }

  return {
    weekStartDate,
    weekHours: asNumber(readProp(raw, "weekHours", "WeekHours")) ?? 0,
    isSaved: asBoolean(readProp(raw, "isSaved", "IsSaved")) ?? false,
  };
}

/**
 * GET /api/v1/sites/work-weeks
 *
 * `date` may be any day inside the wanted week; omit it for the current week. When the week
 * has never been saved the API answers with the previous week's pattern and `isDraft: true`.
 */
export async function getSiteWorkWeek(date?: string) {
  const { data } = await http.get<GetSiteWorkWeekResponseDto>(
    SITE_WORK_WEEKS_PATH,
    { params: date ? { date } : undefined },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to load the work week.");
  }

  return {
    ...data,
    dataModel: coerceWorkWeek(data.dataModel),
  };
}

/**
 * GET /api/v1/sites/work-weeks/recent
 *
 * Every week in the window comes back, saved or not — an unsaved week is a gap in the rate
 * denominator and has to stay visible.
 */
export async function getRecentSiteWorkWeeks(weeks = 6) {
  const requested = Math.min(
    Math.max(Math.trunc(weeks), MIN_RECENT_WEEKS),
    MAX_RECENT_WEEKS,
  );

  const { data } = await http.get<GetRecentSiteWorkWeeksResponseDto>(
    SITE_WORK_WEEKS_RECENT_PATH,
    { params: { weeks: requested } },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to load recent work weeks.");
  }

  const rows = Array.isArray(data.dataModel) ? data.dataModel : [];

  return {
    ...data,
    dataModel: rows
      .map(coerceRecentWeek)
      .filter((row): row is RecentSiteWorkWeekDto => row != null)
      .sort((left, right) =>
        left.weekStartDate.localeCompare(right.weekStartDate),
      ),
  };
}

/** PUT /api/v1/sites/work-weeks — creates or replaces one week's shift pattern. */
export async function saveSiteWorkWeek(payload: SaveSiteWorkWeekRequestDto) {
  const { data } = await http.put<SaveSiteWorkWeekResponseDto>(
    SITE_WORK_WEEKS_PATH,
    {
      weekStartDate: payload.weekStartDate,
      workingDays: payload.workingDays,
      shifts: payload.shifts.map((shift) => ({
        title: shift.title,
        startTime: shift.startTime,
        endTime: shift.endTime,
        headcount: shift.headcount,
      })),
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to save the work week.");
  }

  return data;
}
