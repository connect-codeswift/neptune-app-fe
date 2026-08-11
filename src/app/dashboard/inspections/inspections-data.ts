/** Status label as the backend reports it (e.g. "Scheduled", "Overdue"). The
 * set isn't fixed here — the register derives its filters from the data. */
export type InspectionStatus = string;

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
  /** Display code from detail-summary, e.g. A-0008 — never use as a key. */
  code?: string;
  title: string;
  progress: number;
  items: InspectionItemBreakdown;
  topFindings: readonly string[];
}>;
