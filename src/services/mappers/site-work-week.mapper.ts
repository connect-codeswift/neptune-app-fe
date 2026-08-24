import type {
  RecentSiteWorkWeekDto,
  SiteWorkWeekDto,
  SiteWorkWeekShiftDto,
} from "@/dtos/res/site-work-week-response.dto";

/** ISO weekday numbers in display order, 1 = Monday … 7 = Sunday. */
export const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export const ISO_WEEKDAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const MINUTES_IN_DAY = 1440;
const MS_IN_DAY = 86_400_000;

/** One editable shift row. Times stay strings so a half-typed value survives a re-render. */
export type WorkWeekShiftDraft = Readonly<{
  /** Stable across re-orders and removals, so React keys never collide. */
  key: string;
  title: string;
  startTime: string;
  endTime: string;
  headcount: string;
}>;

function parseClockMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Length of one shift in hours, mirroring the server.
 *
 * 22:00 → 06:00 is 8 hours, not −16: an end that is not after the start crosses midnight.
 * Without the wrap a three-shift site previews 0 hours while typing.
 */
export function shiftHours(startTime: string, endTime: string): number {
  const start = parseClockMinutes(startTime);
  const end = parseClockMinutes(endTime);

  if (start == null || end == null) {
    return 0;
  }

  let minutes = end - start;
  if (minutes <= 0) {
    minutes += MINUTES_IN_DAY;
  }

  return minutes / 60;
}

function draftHeadcount(shift: WorkWeekShiftDraft): number {
  const parsed = Number(shift.headcount.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Person-hours for one working day: every shift's length multiplied by the people on it.
 *
 * Preview only — the `dailyHours` on a saved response is authoritative.
 */
export function previewDailyHours(
  shifts: readonly WorkWeekShiftDraft[],
): number {
  return shifts.reduce(
    (total, shift) =>
      total +
      shiftHours(shift.startTime, shift.endTime) * draftHeadcount(shift),
    0,
  );
}

/** Preview `dailyHours` x the number of active days. */
export function previewWeekHours(
  shifts: readonly WorkWeekShiftDraft[],
  workingDays: readonly number[],
): number {
  return previewDailyHours(shifts) * workingDays.length;
}

/** Total people across shifts — the figure the API validates against the site's user count. */
export function previewHeadcount(
  shifts: readonly WorkWeekShiftDraft[],
): number {
  return shifts.reduce((total, shift) => total + draftHeadcount(shift), 0);
}

export function toShiftDrafts(
  shifts: readonly SiteWorkWeekShiftDto[],
): WorkWeekShiftDraft[] {
  return shifts.map((shift, index) => ({
    key: `shift-${String(index)}`,
    title: shift.title,
    startTime: shift.startTime,
    endTime: shift.endTime,
    headcount: shift.headcount > 0 ? String(shift.headcount) : "",
  }));
}

export function emptyShiftDraft(key: string): WorkWeekShiftDraft {
  return { key, title: "", startTime: "", endTime: "", headcount: "" };
}

/** Monday of the week containing `date`, as a UTC midnight instant. */
export function startOfIsoWeek(date: Date): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // getUTCDay is 0 = Sunday; ISO counts Sunday as day 7, so it is 6 days past Monday.
  const isoDay = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() - (isoDay - 1));
  return utc;
}

export function addWeeks(date: Date, weeks: number): Date {
  return new Date(date.getTime() + weeks * 7 * MS_IN_DAY);
}

/** "Aug 17 – Aug 23, 2026" — the label above the week navigator. */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart.getTime() + 6 * MS_IN_DAY);
  const day = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return `${day.format(weekStart)} – ${day.format(weekEnd)}, ${String(
    weekEnd.getUTCFullYear(),
  )}`;
}

/** "Aug 17" — the heading on a recent-week card. */
export function formatWeekStartShort(weekStartDate: string): string {
  const parsed = new Date(weekStartDate);
  if (Number.isNaN(parsed.getTime())) {
    return weekStartDate;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function formatHoursTotal(hours: number): string {
  return hours.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** ISO date (no time) for the API's `date` query parameter. */
export function toIsoDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isSameWeek(
  left: RecentSiteWorkWeekDto,
  weekStart: Date,
): boolean {
  const parsed = new Date(left.weekStartDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return startOfIsoWeek(parsed).getTime() === weekStart.getTime();
}

/** True when the week has a saved row behind it, as opposed to a carried-forward draft. */
export function isWeekSaved(week: SiteWorkWeekDto | null): boolean {
  return week != null && week.id > 0 && !week.isDraft;
}
