import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";

/** Topic suggestions offered from the + button beside Focus Area. */
export const TOPIC_SUGGESTIONS: readonly string[] = [
  "PPE Compliance",
  "Housekeeping",
  "Emergency Routes",
  "Forklift / pedestrian",
  "Respiratory protection",
];

/** Locations offered in the log dropdown. */
export const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "Warehouse 1", label: "Warehouse 1" },
  { value: "Plant A - Assembly", label: "Plant A - Assembly" },
  { value: "Plant B - Paint", label: "Plant B · Paint" },
  { value: "Plant B - Warehouse", label: "Plant B - Warehouse" },
];

/** Assignees offered for follow-up actions. */
export const ASSIGNEE_OPTIONS: readonly SelectOption[] = [
  { value: "Alicia Chen", label: "Alicia Chen" },
  { value: "Priya Mehra", label: "Priya Mehra" },
  { value: "Sarah Mitchell", label: "Sarah Mitchell" },
  { value: "Mike Reyes", label: "Mike Reyes" },
];

/** Walk-and-Talk Details card. */
export const walkTalkDetailsSchema: FormSchema = [
  {
    type: "text",
    name: "observer",
    label: "Observer",
    required: true,
    colSpan: 6,
    placeholder: "Observer name",
  },
  {
    type: "date",
    name: "date",
    label: "Date",
    required: true,
    colSpan: 6,
  },
  {
    type: "select",
    name: "location",
    label: "Location",
    required: true,
    colSpan: 12,
    options: LOCATION_OPTIONS,
    placeholder: "Select a location",
  },
  {
    type: "text",
    name: "topic",
    label: "Topic / Focus Area",
    required: true,
    colSpan: 12,
    placeholder: "e.g. PPE Compliance, Housekeeping, Emergency Routes…",
    suggestions: TOPIC_SUGGESTIONS,
  },
];

/** Participants card — free-text names via chips + Add. */
export const walkTalkParticipantsSchema: FormSchema = [
  {
    type: "chips",
    name: "participants",
    label: "Participants",
    colSpan: 12,
    options: [],
    allowCustom: true,
    addCustomPlaceholder: "Type name and press Enter…",
  },
];

/** Discussion Notes card. */
export const walkTalkNotesSchema: FormSchema = [
  {
    type: "textarea",
    name: "notes",
    label: "Discussion Notes",
    required: true,
    colSpan: 12,
    rows: 5,
    placeholder:
      "Summarize the key discussion points, observations made, and any employee feedback…",
  },
];

/** One follow-up action draft row (Assigned to / Due date / Action). */
export const walkTalkFollowUpSchema: FormSchema = [
  {
    type: "select",
    name: "assignedTo",
    label: "Assigned to",
    colSpan: 6,
    options: ASSIGNEE_OPTIONS,
    placeholder: "Assigned to",
  },
  {
    type: "date",
    name: "dueDate",
    label: "Due date",
    colSpan: 6,
  },
  {
    type: "text",
    name: "action",
    label: "Follow-up action",
    colSpan: 12,
    placeholder: "Follow-up action 1…",
  },
];

export type FollowUpAction = Readonly<{
  assignedTo: string;
  dueDate: string;
  action: string;
}>;

/** Initial values for the log Walk-and-Talk form. */
export function createWalkTalkLogValues(): FormValues {
  return {
    observer: "Sarah Mitchell",
    date: "",
    location: "",
    topic: "",
    participants: [],
    notes: "",
    assignedTo: "",
    dueDate: "",
    action: "",
  };
}
