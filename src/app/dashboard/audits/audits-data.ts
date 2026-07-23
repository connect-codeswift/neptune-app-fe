export type AuditStatus = "Scheduled" | "In progress" | "Closed";

export type AuditRecord = Readonly<{
  id: string;
  title: string;
  /** Scope line under the title, e.g. "Full plant". */
  scope: string;
  site: string;
  auditor: string;
  /** Completion percentage, 0-100. */
  progress: number;
  status: AuditStatus;
  dueDate: string;
  /** Findings summary, e.g. "12 open"; null renders an em dash. */
  findings: string | null;
}>;

/** Breakdown behind the donut on the detail panel. */
export type AuditItemBreakdown = Readonly<{
  pass: number;
  action: number;
  critical: number;
  pending: number;
}>;

export type AuditDetail = Readonly<{
  id: string;
  title: string;
  progress: number;
  items: AuditItemBreakdown;
  topFindings: readonly string[];
}>;

export const AUDIT_RECORDS: readonly AuditRecord[] = [
  {
    id: "A-2204",
    title: "Q2 Internal EHS Audit",
    scope: "Full plant",
    site: "Plant A",
    auditor: "External · Hartwell",
    progress: 78,
    status: "In progress",
    dueDate: "2026-05-12",
    findings: "12 open",
  },
  {
    id: "A-2203",
    title: "OSHA Walkthrough",
    scope: "General industry",
    site: "Plant B",
    auditor: "OSHA Region 3",
    progress: 100,
    status: "Closed",
    dueDate: "2026-04-09",
    findings: "3 corrected",
  },
  {
    id: "A-2202",
    title: "Forklift Pre-Op Spot Audit",
    scope: "PIV inspection",
    site: "Warehouse 1",
    auditor: "Dana Kim",
    progress: 100,
    status: "Closed",
    dueDate: "2026-04-22",
    findings: "0 open",
  },
  {
    id: "A-2201",
    title: "Fire & Life Safety",
    scope: "Suppression, egress",
    site: "All",
    auditor: "NFPA · Beacon",
    progress: 30,
    status: "Scheduled",
    dueDate: "2026-06-04",
    findings: null,
  },
  {
    id: "A-2200",
    title: "Chemical Storage Audit",
    scope: "Wet lab + paint",
    site: "Plant A",
    auditor: "Internal",
    progress: 65,
    status: "In progress",
    dueDate: "2026-05-01",
    findings: "4 open",
  },
];

export const AUDIT_DETAILS: readonly AuditDetail[] = [
  {
    id: "A-2204",
    title: "Q2 Internal EHS Audit",
    progress: 78,
    items: { pass: 42, action: 8, critical: 4, pending: 14 },
    topFindings: [
      "Hose inspection records gap (Line 2)",
      "Eyewash flow below spec (Wet Lab)",
      "Forklift battery wash signage missing",
    ],
  },
];

/** Detail for an audit id, falling back to the first record's panel. */
export function getAuditDetail(id: string | null): AuditDetail | null {
  return AUDIT_DETAILS.find((detail) => detail.id === id) ?? null;
}
