export type SectionScore = Readonly<{
  section: string;
  /** Score for the section, 0-100. */
  score: number;
}>;

export type InspectionReport = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "INS-2025-001". */
  inspectionId: string;
  title: string;
  /** Template and site line, e.g. "ISO 45001 Annual Inspection · Plant Alpha". */
  scope: string;
  /** Overall inspection score, 0-100. */
  score: number;
  inspector: string;
  date: string;
  status: string;
  executiveSummary: string;
  sectionScores: readonly SectionScore[];
}>;

const DEFAULT_REPORT: InspectionReport = {
  inspectionId: "INS-2025-001",
  title: "Q1 Safety Compliance Inspection - Production",
  scope: "ISO 45001 Annual Inspection · Plant Alpha / Production",
  score: 87,
  inspector: "Sarah Mitchell",
  date: "2025-03-07",
  status: "Completed",
  executiveSummary:
    "The Q1 Safety Compliance Inspection - Production identified 4 findings requiring attention. The inspection scored 87%, indicating good overall compliance with some areas for improvement. All non-conformances have been linked to CAPA records for resolution. Primary areas of concern are PPE compliance and training record currency.",
  sectionScores: [
    { section: "Hazard Communication", score: 100 },
    { section: "PPE Compliance", score: 50 },
    { section: "Emergency Preparedness", score: 100 },
  ],
};

/**
 * Report for an inspection run. Every template shares the same fixture for now —
 * swap this for a fetch once the inspections API exists.
 */
export function getInspectionReport(templateId: string): InspectionReport {
  void templateId;
  return DEFAULT_REPORT;
}
