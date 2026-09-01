import { startOfDay } from "@/lib/date-time-field";

export type DateRange = Readonly<{
  start: Date;
  end: Date;
}>;

function normalizeDateRange(range: DateRange): DateRange {
  const start = startOfDay(range.start);
  const end = startOfDay(range.end);

  if (start.getTime() <= end.getTime()) {
    return { start, end };
  }

  return { start: end, end: start };
}

export function isDateWithinRange(date: Date, range: DateRange): boolean {
  const normalized = normalizeDateRange(range);
  const day = startOfDay(date).getTime();

  return day >= normalized.start.getTime() && day <= normalized.end.getTime();
}
