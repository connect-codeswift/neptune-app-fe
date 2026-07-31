export type InspectionStatus = "Scheduled" | "In progress" | "Closed";

export type InspectionRecord = Readonly<{
  id: string;
  title: string;
  /** Scope line under the title, e.g. "Full plant". */
  scope: string;
  site: string;
  inspector: string;
  /** Completion percentage, 0-100. */
  progress: number;
  status: InspectionStatus;
  dueDate: string;
  /** Findings summary, e.g. "12 open"; null renders an em dash. */
  findings: string | null;
}>;

/** Breakdown behind the donut on the detail panel. */
export type InspectionItemBreakdown = Readonly<{
  pass: number;
  action: number;
  critical: number;
  pending: number;
}>;

export type InspectionDetail = Readonly<{
  id: string;
  title: string;
  progress: number;
  items: InspectionItemBreakdown;
  topFindings: readonly string[];
}>;

export const INSPECTION_RECORDS: readonly InspectionRecord[] = [
  {
    id: "I-2204",
    title: "Q2 Internal EHS Inspection",
    scope: "Full plant",
    site: "Plant A",
    inspector: "External · Hartwell",
    progress: 78,
    status: "In progress",
    dueDate: "2026-05-12",
    findings: "12 open",
  },
  {
    id: "I-2203",
    title: "OSHA Walkthrough",
    scope: "General industry",
    site: "Plant B",
    inspector: "OSHA Region 3",
    progress: 100,
    status: "Closed",
    dueDate: "2026-04-09",
    findings: "3 corrected",
  },
  {
    id: "I-2202",
    title: "Forklift Pre-Op Spot Inspection",
    scope: "PIV inspection",
    site: "Warehouse 1",
    inspector: "Dana Kim",
    progress: 100,
    status: "Closed",
    dueDate: "2026-04-22",
    findings: "0 open",
  },
  {
    id: "I-2201",
    title: "Fire & Life Safety",
    scope: "Suppression, egress",
    site: "All",
    inspector: "NFPA · Beacon",
    progress: 30,
    status: "Scheduled",
    dueDate: "2026-06-04",
    findings: null,
  },
  {
    id: "I-2200",
    title: "Chemical Storage Inspection",
    scope: "Wet lab + paint",
    site: "Plant A",
    inspector: "Internal",
    progress: 65,
    status: "In progress",
    dueDate: "2026-05-01",
    findings: "4 open",
  },
];

export const INSPECTION_DETAILS: readonly InspectionDetail[] = [
  {
    id: "I-2204",
    title: "Q2 Internal EHS Inspection",
    progress: 78,
    items: { pass: 42, action: 8, critical: 4, pending: 14 },
    topFindings: [
      "Hose inspection records gap (Line 2)",
      "Eyewash flow below spec (Wet Lab)",
      "Forklift battery wash signage missing",
    ],
  },
];

/** Detail for an inspection id, falling back to the first record's panel. */
export function getInspectionDetail(id: string | null): InspectionDetail | null {
  return INSPECTION_DETAILS.find((detail) => detail.id === id) ?? null;
}
