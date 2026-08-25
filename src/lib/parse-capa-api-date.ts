/**
 * Normalizes a CAPA API date to `YYYY-MM-DD` for display and for date inputs.
 *
 * The API sends ISO-8601 with an offset — `2026-09-01T00:00:00Z`. It used to send
 * `dd-MM-yyyy H:mm` out of an `nvarchar` column, which this file existed to untangle:
 * it guessed which half was the day by checking whether either number exceeded 12, and
 * fell back to assuming day-first when both were ambiguous. `DueDate` is a real date
 * column now, so that guessing is gone rather than merely unused.
 *
 * The date part is taken verbatim off the front of the ISO string instead of going
 * through `new Date()`. Parsing and re-formatting would shift the calendar day for any
 * viewer whose timezone is behind UTC — a due date of `2026-09-01T00:00:00Z` renders as
 * 31 August in New York, which is the wrong day on a compliance record.
 */
export function parseCapaApiDate(
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) {
    return null;
  }

  const isoDate = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (isoDate) {
    return isoDate[1];
  }

  // Anything else is unexpected. Return it unchanged rather than inventing a date:
  // a visibly odd string is easier to trace than a plausible wrong one.
  return raw;
}

export function formatCapaApiDateForDisplay(
  value: string | null | undefined,
): string {
  return parseCapaApiDate(value) ?? "—";
}
