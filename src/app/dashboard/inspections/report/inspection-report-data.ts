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
  /** The template's pass mark, 0-100 — scores at or above it read as passing. */
  passThreshold: number;
  executiveSummary: string;
  sectionScores: readonly SectionScore[];
}>;
