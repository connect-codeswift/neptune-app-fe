export type FindingSeverity = "Major" | "Moderate" | "Minor";
export type FindingStatus = "Open" | "In Progress" | "Closed";

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

const DEFAULT_FINDINGS: AuditFindings = {
  auditId: "AUD-2025-001",
  subtitle: "Q1 Safety Compliance Audit - Production",
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
 * Findings for an audit run. Every template shares the same fixture for now —
 * swap this for a fetch once the audits API exists.
 */
export function getAuditFindings(templateId: string): AuditFindings {
  void templateId;
  return DEFAULT_FINDINGS;
}
