/**
 * Step 3 Initial Treatment picklist. Multi-select; `none` is exclusive —
 * picking it clears the rest, and picking anything else clears it.
 *
 * The old "minor-clinic" option lumped diagnostic testing in with recordable
 * treatment; under 1904.7 diagnostics alone are not recordable, so the list now
 * separates first aid, treatment beyond first aid, and emergency care.
 */
export const INITIAL_TREATMENT_OPTIONS = [
  { value: "first-aid-on-site", label: "First aid on site" },
  {
    value: "medical-beyond-first-aid",
    label: "Medical treatment beyond first aid (clinic/hospital)",
  },
  { value: "emergency", label: "Emergency care / ER" },
  { value: "none", label: "None" },
] as const;

/** Treatments that usually make the case OSHA recordable on their own. */
export const RECORDABLE_TREATMENT_VALUES: readonly string[] = [
  "medical-beyond-first-aid",
  "emergency",
];

/** First Aid severity can only claim on-site first aid or none — not ER. */
const FIRST_AID_ALLOWED_TREATMENTS: readonly string[] = [
  "first-aid-on-site",
  "none",
];

/**
 * Which Initial Treatment options the severity allows. First Aid hard-filters
 * recordable care; every other severity offers the full list.
 */
export function allowedTreatmentValuesForSeverity(
  severityId: string,
): readonly string[] {
  if (severityId === "first-aid") {
    return FIRST_AID_ALLOWED_TREATMENTS;
  }

  return INITIAL_TREATMENT_OPTIONS.map((option) => option.value);
}

export function treatmentOptionsForSeverity(severityId: string) {
  const allowed = new Set(allowedTreatmentValuesForSeverity(severityId));
  return INITIAL_TREATMENT_OPTIONS.filter((option) => allowed.has(option.value));
}

/** Drops treatments that the current severity no longer allows. */
export function filterTreatmentsForSeverity(
  severityId: string,
  treatments: readonly string[],
): readonly string[] {
  const allowed = new Set(allowedTreatmentValuesForSeverity(severityId));
  return treatments.filter((value) => allowed.has(value));
}

/**
 * Toggles one treatment within a multi-select value, keeping `none`
 * exclusive in both directions. Illegal values for the severity are ignored.
 */
export function toggleInitialTreatment(
  current: readonly string[],
  value: string,
  severityId = "",
): readonly string[] {
  if (
    severityId &&
    !allowedTreatmentValuesForSeverity(severityId).includes(value)
  ) {
    return current;
  }

  if (value === "none") {
    return current.includes("none") ? [] : ["none"];
  }

  const withoutNone = current.filter((item) => item !== "none");
  return withoutNone.includes(value)
    ? withoutNone.filter((item) => item !== value)
    : [...withoutNone, value];
}

function treatmentLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

/** Joins multi-select treatment values into the label string the API expects. */
export function formatInitialTreatmentLabels(
  values: readonly string[],
): string {
  return values
    .map((value) => treatmentLabel(INITIAL_TREATMENT_OPTIONS, value))
    .filter(Boolean)
    .join(" · ");
}

/**
 * Soft (non-blocking) hint when a recordable/DART severity still has only
 * "None" selected. First Aid hard-filters the contradictory options instead.
 */
export function lightTreatmentForSeverityHint(
  severityId: string,
  treatments: readonly string[],
): string | null {
  if (
    !severityId ||
    severityId === "first-aid" ||
    treatments.length === 0 ||
    !treatments.every((value) => value === "none")
  ) {
    return null;
  }

  return "This severity usually implies more than no treatment — review if needed.";
}

export const MECHANISM_OPTIONS = [
  { value: "", label: "Select mechanism…" },
  { value: "equipment-failure", label: "Equipment Failure" },
  { value: "slip-trip-fall", label: "Slip / trip / fall" },
  { value: "struck-by", label: "Struck by object" },
  { value: "caught-in", label: "Caught in / between" },
  { value: "other", label: "Other" },
] as const;

export const NATURE_OF_INJURY_OPTIONS = [
  { value: "", label: "Select nature…" },
  { value: "laceration", label: "Laceration / cut" },
  { value: "bruise", label: "Bruise / contusion" },
  { value: "sprain", label: "Sprain / strain" },
  { value: "burn", label: "Burn" },
  { value: "none", label: "No injury" },
] as const;

/** First Aid Step 2 — What treatment was given? */
export const WHAT_TREATMENT_GIVEN_OPTIONS = [
  { value: "", label: "Select treatment…" },
  { value: "wound-cleaning", label: "Wound cleaning" },
  { value: "bandaging", label: "Bandaging" },
  { value: "ice-pack", label: "Ice pack" },
  { value: "otc-medication", label: "OTC medication" },
  { value: "observation", label: "Observation only" },
  { value: "other", label: "Other" },
] as const;

/** First Aid Step 2 — Treatment provided by? */
export const TREATMENT_PROVIDER_OPTIONS = [
  { value: "", label: "Select provider…" },
  { value: "site-first-aider", label: "Site first aider" },
  { value: "supervisor", label: "Supervisor" },
  { value: "clinic-staff", label: "Clinic staff" },
  { value: "self", label: "Self" },
  { value: "other", label: "Other" },
] as const;

/** First Aid Step 2 — Treatment location? */
export const TREATMENT_LOCATION_OPTIONS = [
  { value: "", label: "Select location…" },
  { value: "onsite-first-aid-room", label: "Onsite first aid room" },
  { value: "at-scene", label: "At the scene" },
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital / ER" },
  { value: "other", label: "Other" },
] as const;

/** First Aid Step 2 — Case disposition? */
export const CASE_DISPOSITION_OPTIONS = [
  { value: "", label: "Select disposition…" },
  {
    value: "case-closed-no-further",
    label: "Case closed - no further actions",
  },
  { value: "monitor", label: "Monitor / follow up" },
  { value: "referred-medical", label: "Referred for medical care" },
  { value: "open", label: "Remains open" },
] as const;

/**
 * Disposition written when an incident is closed from the list/detail views.
 *
 * It is the *label* of the `case-closed-no-further` option, not its value,
 * because `mapReportFormToIncidentDto` persists `optionLabel(...)` — so stored
 * `caseDisposition` values already look like "Case closed - no further actions".
 * Staying on the label keeps closed-from-UI records identical to closed-at-intake
 * records, and it satisfies the `includes("close")` "is closed?" derivation in
 * `incident-list-data.ts` and `incident-list.mapper.ts`.
 *
 * Derived from the option list so a label edit can never silently break closing.
 */
export const CLOSED_CASE_DISPOSITION: string =
  CASE_DISPOSITION_OPTIONS.find(
    (option) => option.value === "case-closed-no-further",
  )?.label ?? "Case closed - no further actions";

export const FIT_FOR_DUTY_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;
