import {
  CAPA_DASHBOARD_ITEMS,
  type CapaDashboardItem,
} from "@/components/capa/capa-dashboard-data";
import {
  CAPA_API_STATUS,
  CAPA_LIFECYCLE_STAGES,
  formatCapaStatusDisplay,
} from "@/lib/capa-filters";

/**
 * One node of the detail-page lifecycle stepper. Mirrors
 * `CapaLifecycleStageDto` — the backend decides the stages and which one is
 * current, so nothing here is derived from a hardcoded sequence.
 */
export type CapaDetailLifecycleStage = Readonly<{
  stage: string;
  isCompleted: boolean;
  isCurrent: boolean;
}>;

/**
 * Stepper to fall back on when a response carries no `lifecycleStages` — the
 * five stored statuses, with everything before the current one ticked.
 * `Closed` ticks the whole track.
 */
export function buildCapaLifecycleStages(
  statusLabel: string | null | undefined,
): readonly CapaDetailLifecycleStage[] {
  const current = formatCapaStatusDisplay(statusLabel);
  // Overdue is derived, not stored; such a CAPA still sits at a real stage, and
  // Open is the only one it can be pinned to without more information.
  const resolved =
    current === CAPA_API_STATUS.overdue ? CAPA_API_STATUS.open : current;
  const currentIndex = CAPA_LIFECYCLE_STAGES.indexOf(
    resolved as (typeof CAPA_LIFECYCLE_STAGES)[number],
  );

  return CAPA_LIFECYCLE_STAGES.map((stage, index) => ({
    stage,
    isCompleted: currentIndex < 0 ? false : index < currentIndex,
    isCurrent: index === currentIndex,
  }));
}

export type CapaDetailTabId = "details" | "tasks" | "comments" | "attachments";

export type CapaDetailPriority = "Critical" | "High" | "Medium" | "Low";

export type CapaDetailTaskStatus = "Completed" | "In Progress" | "Not Started";

export type CapaDetailTask = Readonly<{
  id: string;
  label: string;
  owner: string;
  ownerId?: number | null;
  dueDate: string;
  dueDateIso?: string;
  priority?: string;
  status: CapaDetailTaskStatus;
}>;

export type CapaDetailComment = Readonly<{
  id: string;
  author: string;
  role: string;
  timestamp: string;
  body: string;
}>;

export type CapaDetailAttachment = Readonly<{
  id: string;
  name: string;
  meta: string;
}>;

export type CapaDetailRecord = Readonly<{
  id: string;
  /** Numeric API id for CAPA mutations. */
  numericId: number;
  /** Linked RCA id from CAPA; `null` when none. */
  rcaId: number | null;
  /** Linked incident id when known; `0` for standalone. */
  incidentId: number;
  /** CAPA creator user id (GET /api/v1/capas/{capaId}/comments `userId`). */
  userId: number;
  /** CAPA assignee user id (GET /api/v1/capas/{capaId}/comments `assignedId`). */
  assignedId: number;
  code: string;
  title: string;
  priority: CapaDetailPriority;
  typeLabel: string;
  statusLabel: string;
  /** Hierarchy of controls level from the API. */
  controlLevel: string;
  owner: string;
  verifier: string;
  dueDate: string;
  /** Formatted remaining / overdue label from API `daysLeft`. */
  daysLeftLabel: string;
  source: string;
  module: string;
  /** Lifecycle stepper from GET /api/v1/capas/{id}/detail. */
  lifecycleStages: readonly CapaDetailLifecycleStage[];
  progress: number;
  problemStatement: string;
  rootCause: string;
  proposedAction: string;
  requiredResources: string;
  expectedOutcome: string;
  tasks: readonly CapaDetailTask[];
  comments: readonly CapaDetailComment[];
  attachments: readonly CapaDetailAttachment[];
}>;

const FIGMA_TASKS: readonly CapaDetailTask[] = [
  {
    id: "t1",
    label: "Replace cracked mounting bracket on Press #3",
    owner: "Tom Bradley",
    dueDate: "2026-05-20",
    status: "Completed",
  },
  {
    id: "t2",
    label: "Add guard hardware check to PM checklist",
    owner: "Emily Ross",
    dueDate: "2026-05-25",
    status: "In Progress",
  },
  {
    id: "t3",
    label: "Inspect all similar guards across plant",
    owner: "Tom Bradley",
    dueDate: "2026-05-30",
    status: "In Progress",
  },
  {
    id: "t4",
    label: "Revise Machine Guarding SOP v3.2",
    owner: "Sarah Mitchell",
    dueDate: "2026-06-05",
    status: "Not Started",
  },
  {
    id: "t5",
    label: "Conduct operator awareness briefing",
    owner: "Emily Ross",
    dueDate: "2026-06-10",
    status: "Not Started",
  },
];

const FIGMA_COMMENTS: readonly CapaDetailComment[] = [
  {
    id: "c1",
    author: "Tom Bradley",
    role: "Maintenance Lead",
    timestamp: "2026-05-14 09:12",
    body: "Bracket replacement completed this morning. Press #3 back in service. Photos uploaded to attachments.",
  },
  {
    id: "c2",
    author: "Sarah Mitchell",
    role: "EHS Manager",
    timestamp: "2026-05-13 16:45",
    body: "Good progress. Please ensure the plant-wide inspection covers Presses #4 and #5 as well — they are the same model.",
  },
  {
    id: "c3",
    author: "Emily Ross",
    role: "Safety Officer",
    timestamp: "2026-05-12 11:30",
    body: "PM checklist draft updated. Sending to Tom for review before formal revision.",
  },
  {
    id: "c4",
    author: "Tom Bradley",
    role: "Maintenance Lead",
    timestamp: "2026-05-11 08:00",
    body: "Starting on bracket procurement today. Lead time is 2 days per supplier.",
  },
];

export const CAPA_FIGMA_ATTACHMENTS: readonly CapaDetailAttachment[] = [
  {
    id: "a1",
    name: "Before - cracked bracket.jpg",
    meta: "1.2 MB · Uploaded by Tom Bradley · 2026-05-14",
  },
  {
    id: "a2",
    name: "After - new bracket installed.jpg",
    meta: "980 KB · Uploaded by Tom Bradley · 2026-05-14",
  },
  {
    id: "a3",
    name: "PM Checklist draft v2.pdf",
    meta: "340 KB · Uploaded by Emily Ross · 2026-05-12",
  },
  {
    id: "a4",
    name: "RCA - 5 Whys Report.pdf",
    meta: "215 KB · Uploaded by Sarah Mitchell · 2026-05-10",
  },
];

/** Parse numeric CAPA id from codes like `CAPA-0421` or dashboard ids like `capa-0421`. */
function parseCapaNumericId(idOrCode: string): number {
  const match = /(\d+)\s*$/.exec(idOrCode.trim());
  if (!match?.[1]) return 0;
  return Number.parseInt(match[1], 10) || 0;
}

/** Full Figma CAPA detail — node 1366:2947 / 1370:*. */
const FIGMA_DETAIL: Omit<
  CapaDetailRecord,
  | "id"
  | "numericId"
  | "rcaId"
  | "incidentId"
  | "userId"
  | "assignedId"
  | "code"
  | "title"
  | "owner"
  | "dueDate"
  | "daysLeftLabel"
  | "progress"
  | "source"
> = {
  priority: "Critical",
  typeLabel: "Corrective Action",
  statusLabel: "In Progress",
  controlLevel: "Engineering Controls",
  verifier: "Sarah Mitchell",
  module: "Incident",
  lifecycleStages: buildCapaLifecycleStages("In Progress"),
  problemStatement:
    "Machine press guard was found displaced during routine inspection, creating an unguarded point-of-operation hazard. Three operators in the area were exposed before the issue was identified.",
  rootCause:
    "RCA (5-Whys) identified that the guard mounting bracket fatigued and cracked due to repeated vibration over 18 months of operation. No periodic inspection of guard mounting hardware was included in the PM schedule.",
  proposedAction:
    "1. Replace cracked mounting bracket with reinforced design. 2. Add guard hardware torque-check to 250-hour PM checklist. 3. Conduct inspection of all similar guards plant-wide. 4. Update machine guarding SOP to include periodic hardware checks.",
  requiredResources:
    "Maintenance team (2 technicians), Engineering sign-off, replacement bracket procurement (~$240), SOP revision by EHS.",
  expectedOutcome:
    "Zero unguarded machine hazards on this press and all similar units. Guard hardware inspection embedded in PM process to prevent recurrence.",
  tasks: FIGMA_TASKS,
  comments: FIGMA_COMMENTS,
  attachments: CAPA_FIGMA_ATTACHMENTS,
};

function priorityFromDashboard(
  priority: CapaDashboardItem["priority"],
): CapaDetailPriority {
  if (priority === "high") return "Critical";
  if (priority === "medium") return "Medium";
  return "Low";
}

function statusFromDashboard(status: CapaDashboardItem["status"]): string {
  if (status === "In progress") return "In Progress";
  return status;
}

function synthesizeFromDashboard(item: CapaDashboardItem): CapaDetailRecord {
  const isPrimary = item.id === "capa-0421";
  const numericId =
    parseCapaNumericId(item.code) || parseCapaNumericId(item.id);

  if (isPrimary) {
    return {
      ...FIGMA_DETAIL,
      id: item.id,
      numericId,
      rcaId: null,
      incidentId: 0,
      userId: 0,
      assignedId: 0,
      code: item.code,
      title: item.title,
      owner: item.owner,
      dueDate: item.dueDate,
      daysLeftLabel: item.dueLabel,
      progress: item.progress,
      source:
        item.source.replace(/^From\s+/i, "").split(" · ")[0] ?? item.source,
    };
  }

  return {
    id: item.id,
    numericId,
    rcaId: null,
    incidentId: 0,
    userId: 0,
    assignedId: 0,
    code: item.code,
    title: item.title,
    priority: priorityFromDashboard(item.priority),
    typeLabel: `${item.type} Action`,
    statusLabel: statusFromDashboard(item.status),
    controlLevel: item.control,
    owner: item.owner,
    verifier: "Sarah Mitchell",
    dueDate: item.dueDate,
    daysLeftLabel: item.dueLabel,
    source: item.source.replace(/^From\s+/i, "").split(" · ")[0] ?? item.source,
    module: "Incident",
    lifecycleStages: buildCapaLifecycleStages(statusFromDashboard(item.status)),
    progress: item.progress,
    problemStatement: item.title,
    rootCause: "Root cause analysis pending.",
    proposedAction:
      item.tasks
        .map((task, index) => `${String(index + 1)}. ${task.label}`)
        .join(" ") || "Action plan pending.",
    requiredResources: "To be confirmed.",
    expectedOutcome: "Hazard controlled and recurrence prevented.",
    tasks: item.tasks.map((task, index) => ({
      id: task.id,
      label: task.label,
      owner: item.owner,
      dueDate: item.dueDate,
      status: task.done
        ? ("Completed" as const)
        : index === 0
          ? ("In Progress" as const)
          : ("Not Started" as const),
    })),
    comments: [],
    attachments: CAPA_FIGMA_ATTACHMENTS,
  };
}

export function getCapaDetailById(id: string): CapaDetailRecord | null {
  const item = CAPA_DASHBOARD_ITEMS.find(
    (row) => row.id === id || row.code.toLowerCase() === id.toLowerCase(),
  );
  if (!item) return null;
  return synthesizeFromDashboard(item);
}

export const CAPA_DETAIL_TABS: readonly {
  id: CapaDetailTabId;
  label: string;
  icon: string;
  countKey?: "tasks" | "comments" | "attachments";
}[] = [
  { id: "details", label: "Details", icon: "mdi:file-document-outline" },
  {
    id: "tasks",
    label: "Tasks",
    icon: "mdi:format-list-checks",
    countKey: "tasks",
  },
  {
    id: "comments",
    label: "Comments",
    icon: "mdi:message-outline",
    countKey: "comments",
  },
  {
    id: "attachments",
    label: "Attachments",
    icon: "mdi:paperclip",
    countKey: "attachments",
  },
];
