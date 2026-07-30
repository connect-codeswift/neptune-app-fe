export type FindingSeverity = "Major" | "Moderate" | "Minor";
export type FindingStatus = "Open" | "In Progress" | "Closed";

export type InspectionFinding = Readonly<{
  id: string;
  severity: FindingSeverity;
  /** Checklist section the finding came from, e.g. "PPE Compliance". */
  category: string;
  description: string;
  status: FindingStatus;
  /** True once a corrective action has been raised for this finding. */
  capaCreated: boolean;
}>;

export type InspectionFindings = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "INS-2025-001". */
  inspectionId: string;
  subtitle: string;
  findings: readonly InspectionFinding[];
}>;

const DEFAULT_FINDINGS: InspectionFindings = {
  inspectionId: "INS-2025-001",
  subtitle: "Q1 Safety Compliance Inspection - Production",
  findings: [
    {
      id: "F-1",
      severity: "Major",
      category: "PPE Compliance",
      description: "3 workers observed without required PPE in grinding area",
      status: "Open",
      capaCreated: true,
    },
    {
      id: "F-2",
      severity: "Moderate",
      category: "Training Compliance",
      description: "3 workers overdue on hazard communication training",
      status: "Open",
      capaCreated: true,
    },
    {
      id: "F-3",
      severity: "Minor",
      category: "Fire Safety",
      description: "Fire extinguisher FC-2020-0087 inspection overdue",
      status: "In Progress",
      capaCreated: true,
    },
    {
      id: "F-4",
      severity: "Major",
      category: "Emergency Preparedness",
      description: "Emergency exit sign lighting non-functional in Aisle C",
      status: "Closed",
      capaCreated: true,
    },
  ],
};

/**
 * Findings for an inspection run. Every template shares the same fixture for now —
 * swap this for a fetch once the inspections API exists.
 */
export function getInspectionFindings(templateId: string): InspectionFindings {
  void templateId;
  return DEFAULT_FINDINGS;
}
