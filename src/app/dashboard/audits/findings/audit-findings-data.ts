/** Labels as the backend reports them — the set isn't fixed here. */
export type FindingSeverity = string;
export type FindingStatus = string;

export type AuditFinding = Readonly<{
  id: string;
  /** The finding itself. Required server-side, so it is always present. */
  title: string;
  severity: FindingSeverity;
  /** Free text on the finding, not a checklist section. Empty when unset. */
  category: string;
  /** Optional detail under the title. Empty when the reporter left it blank. */
  description: string;
  status: FindingStatus;
  /** Raised automatically by the submit — a critical fail or a CreateFinding rule. */
  isAutoRaised: boolean;
  /** Already formatted for display, or "" when the finding has no due date. */
  dueDate: string;
}>;

export type AuditFindings = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "AUD-2025-001". */
  auditId: string;
  subtitle: string;
  findings: readonly AuditFinding[];
}>;
