/**
 * Display form of a backend record id, e.g. `6004` → `"NM-6004"`.
 * Values that already carry the prefix (any casing) are passed through.
 */
export function formatRecordDisplayId(
  prefix: string,
  id: string | number | null | undefined,
): string {
  const raw = String(id ?? "").trim();
  if (raw === "") return "";

  const needle = `${prefix}-`;
  if (raw.toUpperCase().startsWith(needle.toUpperCase())) {
    return raw;
  }

  return `${needle}${raw}`;
}

/**
 * Numeric id from a route segment like `42` or `CHEM-42`.
 * Returns null when there is no integer the API can address.
 */
export function parseRecordNumericId(
  idParam: string | null | undefined,
): number | null {
  if (idParam == null) return null;

  const trimmed = idParam.trim();
  if (trimmed === "") return null;

  if (/^\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const match = /-(\d+)$/.exec(trimmed);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}
