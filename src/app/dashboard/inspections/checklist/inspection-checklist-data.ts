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

const DEFAULT_CHECKLIST: InspectionChecklist = {
  inspectionId: "INS-2025-001",
  subtitle: "Q1 Safety Compliance Inspection - Production",
  sections: [
    {
      id: "hazard-communication",
      title: "Hazard Communication",
      items: [
        {
          id: "hc-1",
          question: "Are all chemical containers properly labeled?",
          defaultAnswer: "Yes",
        },
        {
          id: "hc-2",
          question: "Is the SDS binder accessible and current?",
          defaultAnswer: "Yes",
        },
        {
          id: "hc-3",
          question: "Are employees trained on chemical hazards?",
          defaultAnswer: "Yes",
        },
        {
          id: "hc-4",
          question: "Is secondary containment in place where required?",
          defaultAnswer: "Yes",
        },
      ],
    },
    {
      id: "ppe-compliance",
      title: "PPE Compliance",
      items: [
        {
          id: "ppe-1",
          question: "Is appropriate PPE available and in good condition?",
          defaultAnswer: "Yes",
        },
        {
          id: "ppe-2",
          question: "Are PPE requirements posted at each work area?",
          defaultAnswer: "Yes",
        },
        {
          id: "ppe-3",
          question: "Are respirator fit tests up to date?",
          defaultAnswer: "Yes",
        },
      ],
    },
    {
      id: "emergency-preparedness",
      title: "Emergency Preparedness",
      items: [
        {
          id: "ep-1",
          question: "Are emergency exits clearly marked and unobstructed?",
          defaultAnswer: "Yes",
        },
        {
          id: "ep-2",
          question: "Is emergency contact information posted?",
          defaultAnswer: "Yes",
        },
        {
          id: "ep-3",
          question: "Have evacuation drills been run this quarter?",
          defaultAnswer: "Yes",
        },
      ],
    },
  ],
};

/**
 * Checklist for a template. Every template shares the same fixture for now —
 * swap this for a fetch once the inspections API exists.
 */
export function getInspectionChecklist(templateId: string): InspectionChecklist {
  void templateId;
  return DEFAULT_CHECKLIST;
}
