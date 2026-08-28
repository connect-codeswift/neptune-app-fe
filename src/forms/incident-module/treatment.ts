export const INITIAL_TREATMENT_OPTIONS = [
  { value: "", label: "Select treatment…" },
  {
    value: "minor-clinic",
    label: "Minor clinic/hospital medical remedies and diagnostic testing",
  },
  { value: "first-aid-on-site", label: "First aid on site" },
  { value: "none", label: "None" },
  { value: "emergency", label: "Emergency care / ER" },
] as const;

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
 * Form value for "Case closed - no further actions" — hides further-medical UI.
 *
 * This says the medical case needs no follow-up; it does not close the
 * incident. Closing is the wizard's job and lives in `IncidentClosures`. The
 * status derivation used to match this label with `includes("close")`, which
 * marked every such first-aid report Closed at intake — see
 * `deriveIncidentState`, which now reads the backend's `stage` instead.
 */
export const CASE_CLOSED_NO_FURTHER_VALUE = "case-closed-no-further" as const;

export const FIT_FOR_DUTY_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;
