/** Labels as the backend reports them — the set isn't fixed here. */
export type FindingSeverity = string;
export type FindingStatus = string;

export type AuditFinding = Readonly<{
  id: string;
  severity: FindingSeverity;
  /** Checklist section the finding came from, e.g. "PPE Compliance". */
  category: string;
  description: string;
  status: FindingStatus;
  /** True once a corrective action has been raised for this finding. */
  capaCreated: boolean;
}>;

export type AuditFindings = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "AUD-2025-001". */
  auditId: string;
  subtitle: string;
  findings: readonly AuditFinding[];
}>;
