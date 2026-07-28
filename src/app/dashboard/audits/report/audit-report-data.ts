export type SectionScore = Readonly<{
  section: string;
  /** Score for the section, 0-100. */
  score: number;
}>;

export type AuditReport = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "A-6002". */
  auditId: string;
  title: string;
  /** Template and site line, e.g. "Fire Safety Monthly · Plant B". */
  scope: string;
  /** Overall audit score, 0-100. */
  score: number;
  auditor: string;
  date: string;
  status: string;
  executiveSummary: string;
  sectionScores: readonly SectionScore[];
}>;
