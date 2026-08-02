export type SeverityId = "first-aid" | "osha" | "lost-time" | "sia" | "sip";

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
    id: "osha",
    label: "OSHA Recordable",
    lines: ["OSHA Recordable"],
    previewBadge: "Medium",
  },
  {
    id: "lost-time",
    label: "OSHA Lost Time",
    lines: ["OSHA Lost Time"],
    previewBadge: "High",
  },
  {
    id: "sia",
    label: "SIA",
    lines: ["SIA"],
    previewBadge: "Critical",
  },
  {
    id: "sip",
    label: "SIP",
    lines: ["SIP"],
    previewBadge: "Critical",
  },
];
