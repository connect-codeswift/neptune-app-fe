import { addDays, startOfDay, today } from "@/components/incidents/report/shared/report-date-time";

export type DateRange = Readonly<{
  start: Date;
  end: Date;
}>;

export type DateRangePreset =
  | "year_to_date"
  | "last_30_days"
  | "last_90_days";

export function getPresetDateRange(preset: DateRangePreset): DateRange {
  const end = today();

  switch (preset) {
    case "year_to_date":
      return {
        start: startOfDay(new Date(end.getFullYear(), 0, 1)),
        end,
      };
    case "last_90_days":
      return { start: addDays(end, -89), end };
    case "last_30_days":
    default:
      return { start: addDays(end, -29), end };
  }
}

/** Matches the default label shown across incident headers (~last 30 days). */
export function getDefaultDateRange(): DateRange {
  return getPresetDateRange("last_30_days");
}

export function normalizeDateRange(range: DateRange): DateRange {
  const start = startOfDay(range.start);
  const end = startOfDay(range.end);

  if (start.getTime() <= end.getTime()) {
    return { start, end };
  }

  return { start: end, end: start };
}

export function formatHeaderDateRangeLabel(range: DateRange): string {
  const { start, end } = normalizeDateRange(range);

  const monthDay = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  if (start.getFullYear() === end.getFullYear()) {
    return `${monthDay(start)} — ${monthDay(end)}, ${String(end.getFullYear())}`;
  }

  return `${monthDay(start)}, ${String(start.getFullYear())} — ${monthDay(end)}, ${String(end.getFullYear())}`;
}

export function isDateWithinRange(
  date: Date,
  range: DateRange,
): boolean {
  const normalized = normalizeDateRange(range);
  const day = startOfDay(date).getTime();

  return (
    day >= normalized.start.getTime() && day <= normalized.end.getTime()
  );
}
