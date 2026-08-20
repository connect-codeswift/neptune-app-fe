export type AuditReport = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "A-6002". */
  auditId: string;
  title: string;
  /** Template and site line, e.g. "Fire Safety Monthly · Plant B". */
  scope: string;
  auditor: string;
  date: string;
  status: string;
  executiveSummary: string;
}>;
