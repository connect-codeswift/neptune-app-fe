/** Timestamps before this are unset defaults (.NET `DateTime` zero), not ages. */
const MIN_PLAUSIBLE_YEAR = 2000;

/**
 * Elapsed time since `timestamp`, in the largest unit that fits:
 * "45s" / "12m" / "6h" / "3d".
 *
 * The backend sends a naive timestamp (no offset), which .NET writes in UTC —
 * parse it as such. Returns "—" for missing, unparseable, or default dates.
 */
export function formatAge(timestamp: string | null | undefined): string {
  if (!timestamp) return "—";

  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp);
  const created = new Date(hasZone ? timestamp : `${timestamp}Z`);
  const createdMs = created.getTime();

  if (Number.isNaN(createdMs)) return "—";
  if (created.getUTCFullYear() < MIN_PLAUSIBLE_YEAR) return "—";

  const seconds = Math.floor((Date.now() - createdMs) / 1000);
  if (seconds < 0) return "0s";
  if (seconds < 60) return `${String(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h`;

  return `${String(Math.floor(hours / 24))}d`;
}
