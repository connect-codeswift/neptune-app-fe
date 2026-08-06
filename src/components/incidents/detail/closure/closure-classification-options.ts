/**
 * Canonical closure classification values.
 *
 * These strings are contract, not copy. The backend validates them with a regex
 * on SaveIncidentClosureDto and the KPI dashboard counts exact matches on them,
 * so a mismatch silently drops the case out of every tile. Change the `label`
 * freely; never change a `value` without the backend regex changing first.
 */
export const INCIDENT_TYPE_OPTIONS = [
  { value: "Select option", label: "Select option" },
  { value: "Near Miss", label: "Near Miss" },
  { value: "First Aid", label: "First Aid Only" },
  { value: "Medical Only", label: "Medical Treatment Only" },
  { value: "Restricted Work", label: "Restricted Work / Job Transfer" },
  { value: "Lost Time", label: "Lost Time" },
  { value: "Fatality", label: "Fatality" },
] as const;

export const SIF_CLASSIFICATION_OPTIONS = [
  { value: "Non-SIF", label: "Not SIF" },
  { value: "Potential SIF", label: "Potential SIF (P-SIF)" },
  { value: "Actual SIF", label: "Actual SIF" },
] as const;

const INCIDENT_TYPE_VALUES = new Set<string>(
  INCIDENT_TYPE_OPTIONS.map((option) => option.value),
);

export function incidentTypeLabel(value: string): string {
  return (
    INCIDENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

/**
 * Places a free-text value onto a canonical option, or returns "Select option".
 *
 * Used where a classification is seeded from intake copy rather than picked, so
 * an unrecognised string can never reach the API. Deliberately refuses to guess:
 * an unmatched value becomes "Select option" and the user picks explicitly.
 */
export function toCanonicalIncidentType(raw: string | null | undefined): string {
  const text = raw?.trim();
  if (!text || text === "—") return "Select option";
  if (INCIDENT_TYPE_VALUES.has(text)) return text;

  const byLabel = INCIDENT_TYPE_OPTIONS.find(
    (option) => option.label.toLowerCase() === text.toLowerCase(),
  );
  return byLabel?.value ?? "Select option";
}
