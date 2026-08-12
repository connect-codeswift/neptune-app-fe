export const CHECKLIST_ANSWERS = ["Yes", "No", "N/A", "Partial"] as const;

export type ChecklistAnswer = (typeof CHECKLIST_ANSWERS)[number];

export type ChecklistItem = Readonly<{
  id: string;
  question: string;
  /** Pre-filled response, as the design shows a partially completed audit. */
  defaultAnswer?: ChecklistAnswer;
}>;

export type ChecklistSection = Readonly<{
  id: string;
  title: string;
  items: readonly ChecklistItem[];
}>;

export type AuditChecklist = Readonly<{
  /** Reference shown in the breadcrumb, e.g. "AUD-2025-001". */
  auditId: string;
  /** Audit this checklist run belongs to. */
  subtitle: string;
  sections: readonly ChecklistSection[];
}>;
