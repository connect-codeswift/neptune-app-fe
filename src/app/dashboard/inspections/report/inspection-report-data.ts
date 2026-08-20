export type InspectionReport = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "INS-2025-001". */
  inspectionId: string;
  title: string;
  /** Template and site line, e.g. "ISO 45001 Annual Inspection · Plant Alpha". */
  scope: string;
  inspector: string;
  date: string;
  status: string;
  executiveSummary: string;
}>;
