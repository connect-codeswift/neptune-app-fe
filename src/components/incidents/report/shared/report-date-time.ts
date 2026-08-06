/** Digits-only → `MM/DD/YYYY` while typing. */
export function maskMmDdYyyy(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** `MM/DD/YYYY` → `YYYY-MM-DD` for native `<input type="date">`. */
export function mmDdYyyyToIsoDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return "";
  const [, mm, dd, yyyy] = match;
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }
  return `${yyyy}-${mm}-${dd}`;
}

/** `YYYY-MM-DD` → `MM/DD/YYYY`. */
export function isoDateToMmDdYyyy(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${mm}/${dd}/${yyyy}`;
}

/** Today in the `MM/DD/YYYY` shape the date fields use, in local time. */
export function todayMmDdYyyy(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${String(now.getFullYear())}`;
}

/**
 * Keeps digits, a separator, and the letters of "am"/"pm" — everything
 * `parseTimeInput` can read. The old mask stripped to digits only, which made
 * "2:30 pm" impossible to type: the "p" vanished as it was pressed.
 */
export function maskHhMm(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^\d:apm\s]/g, "")
    .slice(0, 8);

  // Only step in for a complete bare 4-digit run: "1430" → "14:30". Shorter
  // runs are left alone deliberately — `parseTimeInput` already reads "230" as
  // half past two, and splitting at three digits would rewrite "143" to "1:43"
  // and then strand the next keystroke as "1:430".
  if (/^\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
  }

  return cleaned;
}

/**
 * Everything a reporter might plausibly type for a time, in `HH:MM` 24-hour.
 * Returns `null` when it can't be read as a real time.
 *
 * Accepts `1430`, `14:30`, `2:30pm`, `230 pm`, `2p`, `9`. The site floor is not
 * where anyone wants to be corrected about time formats, and every one of these
 * has exactly one sensible reading.
 */
export function parseTimeInput(raw: string): string | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  const match = /^(\d{1,2})(?::?(\d{2}))?(?::\d{2})?\s*(a|p|am|pm)?\.?$/.exec(
    text,
  );
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2] === undefined ? 0 : Number(match[2]);
  const meridiem = match[3]?.charAt(0);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
    return null;
  }

  if (meridiem) {
    // 12-hour input: only 1–12 is meaningful, and 12am/12pm are the two that
    // don't follow the "+12" rule.
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "p" && hours !== 12) hours += 12;
    if (meridiem === "a" && hours === 12) hours = 0;
  } else if (hours > 23) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Normalize native/time text to `HH:MM` when valid, else return it untouched. */
export function normalizeHhMm(value: string): string {
  return parseTimeInput(value) ?? value.trim();
}

/** `"14:30"` → `"2:30 PM"`. Empty when the value isn't a valid time. */
export function formatHhMmAs12Hour(value: string): string {
  const parsed = parseTimeInput(value);
  if (!parsed) return "";

  const [hh, mm] = parsed.split(":");
  const hours = Number(hh);
  const meridiem = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(display)}:${mm ?? "00"} ${meridiem}`;
}

/** Current local time as `HH:MM`. */
export function nowHhMm(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** `MM/DD/YYYY` → local-midnight `Date`, or `null` when it isn't a real date. */
export function parseMmDdYyyy(value: string): Date | null {
  const iso = mmDdYyyyToIsoDate(value);
  if (!iso) return null;

  const [yyyy, mm, dd] = iso.split("-").map(Number);
  return new Date(yyyy!, mm! - 1, dd!);
}

/** `Date` → `MM/DD/YYYY`, in local time. */
export function formatMmDdYyyy(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${String(date.getFullYear())}`;
}

/** Local midnight for `date` — the granularity every comparison here works at. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Today at local midnight. */
export function today(): Date {
  return startOfDay(new Date());
}
