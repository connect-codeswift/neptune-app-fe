import {
  CAPA_API_STATUS,
  CAPA_LIFECYCLE_STAGES,
  formatCapaStatusDisplay,
} from "@/lib/capa-filters";

/**
 * One node of the detail-page lifecycle stepper. Mirrors
 * `CapaLifecycleStageDto` â the backend decides the stages and which one is
 * current, so nothing here is derived from a hardcoded sequence.
 */
export type CapaDetailLifecycleStage = Readonly<{
  stage: string;
  isCompleted: boolean;
  isCurrent: boolean;
}>;

/**
 * Stepper to fall back on when a response carries no `lifecycleStages` â the
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
  /** Drives the Source link. Null for a standalone CAPA, which links nowhere. */
  sourceType: string | null;
  sourceId: number | null;
  /** Who raised the CAPA, shown beside the owner, who is a different person. */
  assignedBy: string;
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
