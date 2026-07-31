/**
 * Defensive readers shared by the HazCom mappers.
 *
 * Every HazCom response is documented as bare "Success" with no schema, so
 * rows are read key-by-key with several candidate spellings and no assumption
 * that any of them are present. A key the backend doesn't send degrades to an
 * empty value instead of throwing.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** First key that is present and non-null, or undefined when none are. */
export function readProp(
  record: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

export function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

/** Finite number, or the fallback when the value isn't one. */
export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

/** First integer in a string ("60 min" -> 60), or the fallback. */
export function asLeadingNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const match = /-?\d+(?:\.\d+)?/.exec(asString(value));
  return match ? Number(match[0]) : fallback;
}

export function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  const lower = asString(value).trim().toLowerCase();
  return lower === "true" || lower === "1";
}

/**
 * List-shaped values arrive as one comma-separated string on this API, but a
 * real array is accepted too in case a response differs from the write body.
 */
export function toStringList(value: unknown): string[] {
  const parts = Array.isArray(value)
    ? value.map((item) => asString(item))
    : asString(value).split(",");

  return parts.map((part) => part.trim()).filter((part) => part !== "");
}

/** ISO date portion only — the HazCom tables show dates, never times. */
export function toIsoDate(value: unknown): string {
  const raw = asString(value);
  if (raw === "") {
    return "";
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toISOString().slice(0, 10);
}
