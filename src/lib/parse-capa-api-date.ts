/**
 * Normalizes CAPA API date strings (often DD-MM-YYYY, e.g. "17-08-2026 0:00")
 * to ISO YYYY-MM-DD for display and form fields.
 */
export function parseCapaApiDate(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const raw = value.trim();
  const dashMatch = /^(\d{1,2})-(\d{1,2})-(\d{4})/.exec(raw);
  if (dashMatch) {
    const [, a, b, year] = dashMatch;
    const n1 = Number(a);
    const n2 = Number(b);
    let day: string;
    let month: string;

    if (n1 > 12) {
      day = a;
      month = b;
    } else if (n2 > 12) {
      month = a;
      day = b;
    } else {
      // Backend uses DD-MM-YYYY for values like 08-09-2026 and 17-08-2026.
      day = a;
      month = b;
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${String(y)}-${m}-${d}`;
  }

  return raw;
}

export function formatCapaApiDateForDisplay(
  value: string | null | undefined,
): string {
  return parseCapaApiDate(value) ?? "—";
}
