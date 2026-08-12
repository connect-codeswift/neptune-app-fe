export const CHECKLIST_ANSWERS = ["Yes", "No", "N/A", "Partial"] as const;

export type ChecklistAnswer = (typeof CHECKLIST_ANSWERS)[number];

export type ChecklistItem = Readonly<{
  id: string;
  question: string;
  /** Pre-filled response, as the design shows a partially completed inspection. */
  defaultAnswer?: ChecklistAnswer;
}>;

export type ChecklistSection = Readonly<{
  id: string;
  title: string;
  items: readonly ChecklistItem[];
}>;

export type InspectionChecklist = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "INS-2025-001". */
  inspectionId: string;
  /** Inspection this checklist run belongs to. */
  subtitle: string;
  sections: readonly ChecklistSection[];
}>;
