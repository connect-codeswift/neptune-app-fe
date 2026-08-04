/** Labels as the backend reports them — the set isn't fixed here. */
export type FindingSeverity = string;
export type FindingStatus = string;

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
  /** Reference shown in the breadcrumb, e.g. "I-8". */
  inspectionId: string;
  subtitle: string;
  findings: readonly InspectionFinding[];
}>;
