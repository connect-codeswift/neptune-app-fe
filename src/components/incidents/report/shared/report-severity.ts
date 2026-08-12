/**
 * OSHA 1904.7 / ANSI Z16.2 outcome classes. The reporter picks the outcome
 * once, on step 1; everything recordable about it (OSHA recordable, DART) is
 * derived from this pick — see report-classification.ts — and confirmed by EHS
 * after investigation.
 *
 * `""` is the unanswered state: severity has no default, because the intake
 * report is the reporter's best guess and a pre-selected answer would read as
 * a deliberate one on a regulated record.
 */
export type SeverityId =
  | "first-aid"
  | "medical-treatment"
  | "restricted-duty"
  | "lost-time"
  | "fatality";

export type SeverityOption = Readonly<{
  id: SeverityId;
  label: string;
  lines: readonly string[];
  /** Tier shown in the Live Preview and Step 5 review, not on the picker. */
  previewBadge: string;
}>;

export const SEVERITY_OPTIONS: readonly SeverityOption[] = [
  {
    id: "first-aid",
    label: "First Aid",
    lines: ["First Aid"],
    previewBadge: "Low",
  },
  {
    id: "medical-treatment",
    label: "Medical Treatment",
    lines: ["Medical Treatment"],
    previewBadge: "Medium",
  },
  {
    id: "restricted-duty",
    label: "Restricted Duty",
    lines: ["Restricted Duty"],
    previewBadge: "High",
  },
  {
    id: "lost-time",
    label: "Lost Time",
    lines: ["Lost Time"],
    previewBadge: "High",
  },
  {
    id: "fatality",
    label: "Fatality",
    lines: ["Fatality"],
    previewBadge: "Critical",
  },
];

export function severityOptionFor(
  severityId: string,
): SeverityOption | undefined {
  return SEVERITY_OPTIONS.find((option) => option.id === severityId);
}

export function isSeverityPicked(
  severity: SeverityId | "",
): severity is SeverityId {
  return severity !== "";
}
