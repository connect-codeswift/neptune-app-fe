export type SectionScore = Readonly<{
  section: string;
  /** Score for the section, 0-100. */
  score: number;
}>;

export type AuditReport = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "AUD-2025-001". */
  auditId: string;
  title: string;
  /** Template and site line, e.g. "ISO 45001 Annual Audit · Plant Alpha". */
  scope: string;
  /** Overall audit score, 0-100. */
  score: number;
  auditor: string;
  date: string;
  status: string;
  executiveSummary: string;
  sectionScores: readonly SectionScore[];
}>;

const DEFAULT_REPORT: AuditReport = {
  auditId: "AUD-2025-001",
  title: "Q1 Safety Compliance Audit - Production",
  scope: "ISO 45001 Annual Audit · Plant Alpha / Production",
  score: 87,
  auditor: "Sarah Mitchell",
  date: "2025-03-07",
  status: "Completed",
  executiveSummary:
    "The Q1 Safety Compliance Audit - Production identified 4 findings requiring attention. The audit scored 87%, indicating good overall compliance with some areas for improvement. All non-conformances have been linked to CAPA records for resolution. Primary areas of concern are PPE compliance and training record currency.",
  sectionScores: [
    { section: "Hazard Communication", score: 100 },
    { section: "PPE Compliance", score: 50 },
    { section: "Emergency Preparedness", score: 100 },
  ],
};

/**
 * Report for an audit run. Every template shares the same fixture for now —
 * swap this for a fetch once the audits API exists.
 */
export function getAuditReport(templateId: string): AuditReport {
  void templateId;
  return DEFAULT_REPORT;
}
