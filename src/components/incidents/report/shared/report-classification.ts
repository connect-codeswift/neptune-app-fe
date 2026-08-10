/**
 * `""` is the unanswered state.
 *
 * These used to default to "No", which made a question nobody looked at
 * indistinguishable from one deliberately answered "No" — bad for a safety
 * record that gets audited. They now start empty so the reporter has to say.
 */
export type ClassificationValue = "Yes" | "No" | "";

export type ClassificationField = Readonly<{
  id: string;
  label: string;
  defaultValue: ClassificationValue;
  hint?: string;
}>;

/**
 * Step 1 asks only about who was involved. Gender is never a form question —
 * it is stamped from the employee's profile when they are picked from the
 * site roster.
 */
export const STEP_ONE_CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  {
    id: "tempWorker",
    label: "Temp / Non-Employee Involved?",
    defaultValue: "",
  },
];

/**
 * Step 4 — the yes/no flags, asked in this order. Everything derivable from
 * severity (OSHA Recordable, DART) is derived instead and shown as a read-only
 * banner; SIA is not asked at intake at all (a fatality implies it, anything
 * else is confirmed at closure).
 *
 * "OSHA Notification Required?" is not in this list because it lives on the
 * form as `oshaNotificationRequired`, not in `classifications` — step 4 renders
 * it between SIF Potential and Drug or Alcohol.
 */
export const STEP_FOUR_CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  // Manual under 1904.5 — not derivable from the outcome.
  { id: "workRelated", label: "Work Related?", defaultValue: "" },
  {
    id: "serious",
    label: "SIF Potential? (SIP)",
    defaultValue: "",
    hint: "Could this have caused a life-altering or life-threatening injury? Valid at any severity. SIA and SIF are derived in the banner — not asked here.",
  },
  { id: "drugAlcohol", label: "Drug or Alcohol Related?", defaultValue: "" },
  { id: "fleet", label: "Fleet Vehicle Involved?", defaultValue: "" },
  { id: "emergency", label: "Emergency Services Called?", defaultValue: "" },
];

/** Every classification question held on the form, in seed order. */
export const CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  ...STEP_ONE_CLASSIFICATION_FIELDS,
  ...STEP_FOUR_CLASSIFICATION_FIELDS,
];

export const YES_NO_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;

/**
 * "OSHA Recordable?" is derived from the severity, never asked.
 *
 * First Aid is the one outcome OSHA explicitly excludes from recordability
 * (1904.7 first-aid list); medical treatment, restricted duty, lost time and
 * fatality are all recordable by definition. `""` (severity not yet picked)
 * derives to `""` — an unknown, not a "No".
 */
export function oshaRecordableForSeverity(
  severityId: string,
): ClassificationValue {
  if (!severityId) {
    return "";
  }

  return severityId === "first-aid" ? "No" : "Yes";
}

/**
 * DART — days away, restricted or transferred — derived from the severity the
 * same way recordability is. Restricted duty, lost time and fatality are DART
 * cases by definition; first aid and medical treatment alone are not.
 */
export function dartForSeverity(severityId: string): ClassificationValue {
  if (!severityId) {
    return "";
  }

  return severityId === "restricted-duty" ||
    severityId === "lost-time" ||
    severityId === "fatality"
    ? "Yes"
    : "No";
}

/**
 * SIA (SIF Actual) at intake. A fatality is definitionally an actual SIF;
 * every other severity waits for EHS confirmation at closure — the reporter
 * cannot judge life-altering medical outcomes at intake.
 */
export type SiaIntakeValue = "Yes" | "Pending" | "";

export function siaForSeverity(severityId: string): SiaIntakeValue {
  if (!severityId) {
    return "";
  }

  return severityId === "fatality" ? "Yes" : "Pending";
}

/**
 * SIF = SIA OR SIP. Never asked — computed for banners and review.
 *
 * Display rules at intake:
 * - SIA Yes or SIP Yes → Yes
 * - SIA Pending and SIP No → No (not SIF unless closure upgrades SIA)
 * - SIA Pending and SIP unanswered → Pending
 */
export type SifIntakeValue = "Yes" | "No" | "Pending" | "";

export function sifForIntake(
  severityId: string,
  sipAnswer: ClassificationValue,
): SifIntakeValue {
  const sia = siaForSeverity(severityId);
  if (!sia) {
    return "";
  }

  if (sia === "Yes" || sipAnswer === "Yes") {
    return "Yes";
  }

  if (sipAnswer === "No") {
    return "No";
  }

  return "Pending";
}

/** Placeholder site metrics until a site-stats API exists. */
export const SITE_STATS = [
  { label: "Days w/o LTI", value: "—" },
  { label: "Open hazards", value: "—" },
  { label: "Recent similar", value: "—" },
  { label: "Site supervisor", value: "—" },
] as const;
