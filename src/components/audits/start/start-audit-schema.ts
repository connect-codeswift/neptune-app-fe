import type {
  FormSchema,
  SelectOption,
  SelectPagination,
} from "@/components/form-builder";

/** Sites an audit can be scheduled against, matching the audit register. */
const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "all", label: "All" },
  { value: "plant-a", label: "Plant A" },
  { value: "plant-b", label: "Plant B" },
  { value: "warehouse-1", label: "Warehouse 1" },
];

/** Shape of a submitted Schedule Audit form, keyed by the schema field names. */
export type StartAuditValues = {
  auditTitle: string;
  template: string;
  location: string;
  auditor: string;
  scheduledDate: string;
  dueDate: string;
};

export type StartAuditSchemaOptions = Readonly<{
  /** Templates for the current page of GET /api/v1/audit-templates. */
  templateOptions: readonly SelectOption[];
  /** Prev/next paging for the template dropdown, when more than one page. */
  templatePagination?: SelectPagination;
  /** Preselected template (via "Use template"), so its label shows even when
   * it isn't on the loaded page. */
  selectedTemplateOption?: SelectOption;
  /** Arrived via "Use template" — the choice is fixed, so lock the dropdown. */
  isTemplateLocked?: boolean;
  /**
   * Editing an existing run rather than scheduling a new one. Two differences:
   * the template is always locked, because a run's answers are keyed to the
   * version pinned at creation; and the dates drop their `not-past` limit,
   * because a run scheduled last week must stay saveable while its title is
   * corrected — otherwise the form rejects the value it was seeded with.
   */
  isEdit?: boolean;
}>;

/**
 * Templates come from an API, so the schema is built per render rather than
 * declared as a module constant. The auditor field fetches its own people.
 */
export function buildStartAuditSchema(
  options: StartAuditSchemaOptions,
): FormSchema {
  const {
    templateOptions,
    templatePagination,
    selectedTemplateOption,
    isTemplateLocked = false,
    isEdit = false,
  } = options;

  const templateLocked = isTemplateLocked || isEdit;
  const dateLimit = isEdit ? undefined : ("not-past" as const);

  return [
    {
      type: "text",
      name: "auditTitle",
      label: "Audit Title",
      required: true,
      colSpan: 12,
      placeholder: "e.g., Q1 Production Safety Audit",
    },
    {
      type: "select",
      name: "template",
      label: "Template",
      required: true,
      colSpan: 12,
      placeholder: "Select template",
      options: templateOptions,
      // A locked field has nothing to page through or reveal.
      pagination: templateLocked ? undefined : templatePagination,
      selectedOption: selectedTemplateOption,
      disabled: templateLocked,
    },
    {
      type: "select",
      name: "location",
      label: "Location",
      required: true,
      colSpan: 6,
      placeholder: "Select location",
      options: LOCATION_OPTIONS,
      allowCustom: true,
      addCustomLabel: "Add custom location",
      addCustomPlaceholder: "e.g. Plant C · Loading Dock 2",
    },
    {
      type: "person",
      name: "auditor",
      label: "Auditor",
      required: true,
      colSpan: 6,
      placeholder: "Search for an auditor…",
      // Org-wide: an auditor is often from another site.
      usersSource: "org",
      // External auditors aren't in the user directory, and the payload files
      // an id, so this stays a picked person.
    },
    {
      type: "date",
      name: "scheduledDate",
      label: "Scheduled Date",
      required: true,
      colSpan: 6,
      // An audit is scheduled, not recorded: a past date lands it in the
      // overdue bucket the moment it is created. Lifted when editing — see
      // `isEdit`.
      limit: dateLimit,
    },
    {
      type: "date",
      name: "dueDate",
      label: "Due Date",
      required: false,
      colSpan: 6,
      // Same rule as scheduledDate above — a due date cannot open overdue.
      limit: dateLimit,
    },
  ];
}
