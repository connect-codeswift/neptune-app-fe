import type {
  CapaItem,
  CapaSummaryCounts,
  HierarchyControlRow,
} from "@/components/incidents/detail/linked-capa/capa-types";
import type { IncidentLinkedItem } from "@/components/incidents/detail/details/IncidentDetailLinkedCard";
import type { IncidentCapa } from "@/components/incidents/list/incident-list-types";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";
import type {
  CapaDetailAttachment,
  CapaDetailComment,
  CapaDetailPriority,
  CapaDetailLifecycleStage,
  CapaDetailRecord,
  CapaDetailTask,
  CapaDetailTaskStatus,
} from "@/components/capa/detail/capa-detail-data";
import type { CapaVerificationRequestDto } from "@/dtos/req/capa-verification-request.dto";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type {
  CapaTaskStatus,
  CapaTaskStatusRequestDto,
} from "@/dtos/req/capa-task-status-request.dto";
import type { CapaTaskRequestDto } from "@/dtos/req/capa-task-request.dto";
import type { CapaAttachmentItemDto } from "@/dtos/res/capa-attachment-response.dto";
import type { CapaCommentDto } from "@/dtos/res/capa-comment-response.dto";
import type { CapaLifecycleStageDto } from "@/dtos/res/capa-detail-response.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import type { CapaVerificationDto } from "@/dtos/res/capa-verification-response.dto";
import { buildCapaLifecycleStages } from "@/components/capa/detail/capa-detail-data";
import {
  CAPA_VERIFICATION_CHECKLIST,
  createCapaVerificationInitialValues,
} from "@/components/capa/detail/capa-verification-schema";
import type { FormValues } from "@/components/form-builder";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { formatCapaStatusDisplay } from "@/lib/capa-filters";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  formatCapaApiDateForDisplay,
  parseCapaApiDate,
} from "@/lib/parse-capa-api-date";
import { userNameFor } from "@/lib/map-user";

export const CAPA_CONTROL_LEVELS = [
  "Elimination",
  "Substitution",
  "Engineering Controls",
  "Administrative Controls",
  "PPE",
] as const;

export type CapaControlLevel = (typeof CAPA_CONTROL_LEVELS)[number];

export type { CapaSummaryCounts };

export type LinkedCapaViewModel = Readonly<{
  items: readonly CapaItem[];
  summary: CapaSummaryCounts;
  hierarchy: readonly HierarchyControlRow[];
  noticeMessage: string | null;
}>;

const EMPTY_SUMMARY: CapaSummaryCounts = {
  totalCount: 0,
  notStartedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
};

function normalizeControlLevel(value: string): string {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower === "administrative controls" ||
    lower === "administrative control"
  ) {
    return "Administrative Controls";
  }
  if (lower === "engineering controls" || lower === "engineering control") {
    return "Engineering Controls";
  }
  if (lower === "elimination") return "Elimination";
  if (lower === "substitution") return "Substitution";
  if (lower === "ppe") return "PPE";

  return trimmed;
}

function formatDueDate(value: string | null | undefined): string {
  return formatCapaApiDateForDisplay(value);
}

function normalizeActionType(value: string): CapaItem["actionType"] {
  return value.trim().toLowerCase() === "preventive"
    ? "Preventive"
    : "Corrective";
}

function normalizeStatus(dto: CapaDto): CapaItem["status"] {
  const raw = (dto.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  // This panel has one bucket for "work done, not yet closed", so the API's
  // Completed and Pending Verification both land in it. Splitting them needs a
  // new union member and copy decisions in the incidents cards — do that with
  // the send-for-verification work, not here. Without `pendingverification`
  // listed, that status fell through to the priority guess at the bottom.
  if (
    raw === "verified" ||
    raw === "pendingverification" ||
    raw === "pending" ||
    raw === "complete" ||
    raw === "completed"
  ) {
    return "Verified";
  }
  if (raw === "closed" || raw === "dropped") {
    return "Closed";
  }
  if (
    raw === "inprogress" ||
    raw === "progress" ||
    raw === "active" ||
    raw === "inprocess"
  ) {
    return "In progress";
  }
  if (raw === "overdue") {
    // Dashboard register surfaces overdue as its own status.
    return "In progress";
  }
  if (
    raw === "planning" ||
    raw === "planned" ||
    raw === "new" ||
    raw === "open"
  ) {
    return "Planning";
  }

  // API has no status today — derive a light signal from priority.
  const priority = (dto.priority ?? "").trim().toLowerCase();
  if (priority === "high") {
    return "In progress";
  }

  return "Planning";
}

function progressForStatus(
  _status: CapaItem["status"],
  explicit: number | null | undefined,
): number {
  if (
    typeof explicit === "number" &&
    Number.isFinite(explicit) &&
    explicit >= 0
  ) {
    return Math.min(100, Math.max(0, Math.round(explicit)));
  }

  return 0;
}

/** Maps PATCH /api/v1/capa-tasks/{taskId}/status values to progress bar fill. */
function capaTaskStatusToProgressPercent(
  status: CapaTaskStatus | null | undefined,
): number {
  switch (status) {
    case "Completed":
      return 100;
    case "InProcess":
      return 50;
    case "NotStarted":
    default:
      return 0;
  }
}

/** Average progress across all tasks for a CAPA. */
function computeProgressPercentFromTasks(
  tasks: readonly CapaTaskDto[],
): number | null {
  if (tasks.length === 0) {
    return null;
  }

  const total = tasks.reduce(
    (sum, task) => sum + capaTaskStatusToProgressPercent(task.status),
    0,
  );

  return Math.round(total / tasks.length);
}

/** Primary task status when a CAPA has one or more tasks. */
function resolvePrimaryCapaTaskStatus(
  tasks: readonly CapaTaskDto[],
): CapaTaskStatus | null {
  const primary = tasks[0];
  return primary?.status ?? null;
}

/** Human-readable label for assignee task status. */
export function formatCapaTaskStatusLabel(
  status: CapaTaskStatus | null | undefined,
): string {
  switch (status) {
    case "NotStarted":
      return "Not started";
    case "InProcess":
      return "In progress";
    case "Completed":
      return "Completed";
    default:
      return "Not started";
  }
}

export function capaTaskStatusBadgeClass(
  status: CapaTaskStatus | null | undefined,
): string {
  switch (status) {
    case "InProcess":
      return "bg-ehs-normal-blue/14 text-ehs-normal-blue";
    case "Completed":
      return "bg-ehs-green/14 text-ehs-green";
    case "NotStarted":
    default:
      return "bg-ehs-gray/14 text-ehs-gray";
  }
}

/** Cycle task status when the assignee updates their CAPA action. */
function resolveCapaProgress(
  dto: CapaDto,
  status: CapaItem["status"],
  tasks: readonly CapaTaskDto[] | undefined,
): number {
  if (tasks) {
    if (tasks.length > 0) {
      return computeProgressPercentFromTasks(tasks) ?? 0;
    }
    // Tasks were fetched but none exist — not started yet.
    return 0;
  }

  return progressForStatus(
    status,
    dto.progressPercent ?? dto.progressPercentage ?? dto.progress,
  );
}

function resolveAssignee(
  dto: CapaDto,
  options?: Readonly<{
    currentUserId?: number;
    taskOwnerName?: string | null;
  }>,
): string {
  const named =
    options?.taskOwnerName?.trim() ||
    dto.assignedName?.trim() ||
    dto.assigneeName?.trim() ||
    dto.ownerName?.trim() ||
    "";
  if (named) {
    return named;
  }

  if (dto.assignedId == null || dto.assignedId === 0) {
    return "—";
  }

  if (options?.currentUserId != null && dto.userId === options.currentUserId) {
    return getAuthDisplayName(`User ${String(dto.userId)}`);
  }

  return `User ${String(dto.userId)}`;
}

function mapCapaDtoToItem(
  dto: CapaDto,
  options?: Readonly<{
    currentUserId?: number;
    tasks?: readonly CapaTaskDto[];
  }>,
): CapaItem {
  const status = normalizeStatus(dto);
  const tasks = options?.tasks;
  const progressPercent = resolveCapaProgress(dto, status, tasks);

  return {
    id: String(dto.id),
    numericId: dto.id,
    incidentId: dto.incidentId,
    userId: dto.userId,
    assignedId: dto.assignedId ?? null,
    rcaId: dto.rcaId ?? null,
    description:
      (dto.description ?? dto.title ?? "").trim() || `CAPA-${String(dto.id)}`,
    isDrop: dto.isDrop ?? false,
    code: formatRecordDisplayId("CAPA", dto.id),
    controlCategory: normalizeControlLevel(dto.controlLevel),
    actionType: normalizeActionType(dto.capaType),
    status,
    statusTone: status === "Verified" ? "green" : "gray",
    title:
      dto.title?.trim() || dto.description?.trim() || `CAPA-${String(dto.id)}`,
    assignee: resolveAssignee(dto, {
      currentUserId: options?.currentUserId,
    }),
    dueDate: formatDueDate(dto.dueDate),
    priority: dto.priority?.trim() || "Medium",
    progressPercent,
    primaryTaskId: tasks?.[0]?.id ?? null,
    taskStatus: resolvePrimaryCapaTaskStatus(tasks ?? []),
  };
}

function buildCapaSummary(items: readonly CapaItem[]): CapaSummaryCounts {
  let notStartedCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;

  for (const item of items) {
    switch (item.taskStatus) {
      case "InProcess":
        inProgressCount += 1;
        break;
      case "Completed":
        completedCount += 1;
        break;
      case "NotStarted":
      default:
        notStartedCount += 1;
        break;
    }
  }

  return {
    totalCount: items.length,
    notStartedCount,
    inProgressCount,
    completedCount,
  };
}

function buildControlCoverage(
  items: readonly CapaItem[],
): readonly HierarchyControlRow[] {
  const counts = new Map<string, number>(
    CAPA_CONTROL_LEVELS.map((level) => [level, 0]),
  );

  for (const item of items) {
    const level = normalizeControlLevel(item.controlCategory);
    if (counts.has(level)) {
      counts.set(level, (counts.get(level) ?? 0) + 1);
    }
  }

  return CAPA_CONTROL_LEVELS.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }));
}

function buildCoverageNotice(
  hierarchy: readonly HierarchyControlRow[],
): string | null {
  const elimination = hierarchy.find((row) => row.label === "Elimination");
  if (!elimination || elimination.count > 0) {
    return null;
  }

  return "No elimination control yet. Consider removing or redesigning the hazard at source.";
}

export function mapCapaItemsToLinkedItems(
  items: readonly CapaItem[],
  options?: Readonly<{ limit?: number }>,
): readonly IncidentLinkedItem[] {
  const visible = options?.limit ? items.slice(0, options.limit) : items;

  return visible.map((item) => ({
    id: item.code,
    label: item.title,
    icon:
      item.actionType === "Preventive"
        ? "mdi:shield-check-outline"
        : "mdi:clipboard-check-outline",
  }));
}

/** Maps linked CAPA view items for the incident list sidebar panel. */
export function mapCapaItemsToIncidentCapas(
  items: readonly CapaItem[],
): readonly IncidentCapa[] {
  return items.map((item) => ({
    id: item.code,
    hierarchy: item.controlCategory,
    status: item.status,
    priority: item.priority,
    description: item.title,
    assignee: item.assignee,
    dueDate: item.dueDate,
    type: item.actionType,
  }));
}

export function mapCapaDtosToLinkedView(
  dtos: readonly CapaDto[],
  options?: Readonly<{
    currentUserId?: number;
    tasksByCapaId?: ReadonlyMap<number, readonly CapaTaskDto[]>;
  }>,
): LinkedCapaViewModel {
  const active = dtos.filter((dto) => !dto.isDrop);
  const items = active.map((dto) =>
    mapCapaDtoToItem(dto, {
      currentUserId: options?.currentUserId,
      tasks: options?.tasksByCapaId?.get(dto.id),
    }),
  );
  const summary = buildCapaSummary(items);
  const hierarchy = buildControlCoverage(items);
  const noticeMessage = buildCoverageNotice(hierarchy);

  return { items, summary, hierarchy, noticeMessage };
}

function dashboardPriority(value: string): CapaDashboardItem["priority"] {
  const lower = value.trim().toLowerCase();
  if (lower === "high") return "high";
  if (lower === "low") return "low";
  return "medium";
}

function formatDashboardDueLabel(dueDate: string | null | undefined): string {
  const iso = parseCapaApiDate(dueDate);
  if (!iso) return "—";

  const due = new Date(`${iso}T23:59:59`);
  if (Number.isNaN(due.getTime())) return "—";

  const days = Math.ceil((due.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  return `${String(days)}d left`;
}

/** Prefers API `daysLeft`; falls back to computing from due date. */
export function formatCapaDaysLeftLabel(
  daysLeft: number | null | undefined,
  options?: Readonly<{
    dueDate?: string | null;
    status?: string | null;
  }>,
): string {
  const status = (options?.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (status === "closed") {
    return "Complete";
  }

  if (typeof daysLeft === "number" && Number.isFinite(daysLeft)) {
    const days = Math.trunc(daysLeft);
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    return `${String(days)}d left`;
  }

  return formatDashboardDueLabel(options?.dueDate);
}

/** Maps GET /api/v1/capas list rows into CAPA dashboard register items. */
export function mapCapaDtoToDashboardItem(
  dto: CapaDto,
  options?: Readonly<{ currentUserId?: number }>,
): CapaDashboardItem {
  const item = mapCapaDtoToItem(dto, {
    currentUserId: options?.currentUserId,
  });
  const status = formatCapaStatusDisplay(dto.status);
  const dueLabel = formatCapaDaysLeftLabel(dto.daysLeft, {
    dueDate: dto.dueDate,
    status: dto.status,
  });

  return {
    id: String(dto.id),
    code: item.code,
    type: item.actionType,
    title: item.title,
    source:
      dto.sourceInfo?.trim() ||
      (dto.incidentId > 0
        ? `From Incident · ${String(dto.incidentId)}`
        : item.controlCategory),
    control: item.controlCategory,
    owner: item.assignee,
    progress: item.progressPercent,
    status,
    dueDate: item.dueDate,
    dueLabel,
    priority: dashboardPriority(item.priority),
    daysLeft: dueLabel,
    tasks: [],
  };
}

export function mapCapaDtosToDashboardItems(
  dtos: readonly CapaDto[],
  options?: Readonly<{ currentUserId?: number }>,
): CapaDashboardItem[] {
  return dtos
    .filter((dto) => !dto.isDrop)
    .map((dto) => mapCapaDtoToDashboardItem(dto, options));
}

export const EMPTY_LINKED_CAPA_VIEW: LinkedCapaViewModel = {
  items: [],
  summary: EMPTY_SUMMARY,
  hierarchy: CAPA_CONTROL_LEVELS.map((label) => ({ label, count: 0 })),
  noticeMessage: buildCoverageNotice(
    CAPA_CONTROL_LEVELS.map((label) => ({ label, count: 0 })),
  ),
};

/** Normalize UI control level (Add CAPA modal) to API enum casing. */
export function toApiControlLevel(level: string): string {
  return normalizeControlLevel(level);
}

/** Map API / view-model control level to hierarchy selector value. */
export function toSelectorControlLevel(
  value: string,
):
  | import("@/components/incidents/shared/capa/CapaHierarchySelector").ControlLevel
  | null {
  const normalized = normalizeControlLevel(value).toLowerCase();

  if (normalized === "elimination") return "Elimination";
  if (normalized === "substitution") return "Substitution";
  if (normalized.includes("engineering")) return "Engineering Controls";
  if (normalized.includes("administrative")) return "Administrative controls";
  if (normalized === "ppe") return "PPE";

  return null;
}

/** Short label required by POST /api/v1/capas — derived from the action description. */
export function buildCapaTitleFromDescription(description: string): string {
  const trimmed = description.trim();
  const firstLine = trimmed.split(/\r?\n/)[0]?.trim() ?? trimmed;
  if (firstLine.length <= 120) {
    return firstLine;
  }
  return `${firstLine.slice(0, 117)}…`;
}

function parseOptionalUserId(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.trunc(parsed);
}

function normalizePriority(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower === "high") return "High";
  if (lower === "low") return "Low";
  return "Medium";
}

function buildCapaMutationPayload(input: {
  id: number;
  incidentId: number;
  userId: number;
  assignedId: number | null;
  rcaId: number | null;
  isDrop: boolean;
  controlLevel: string;
  description: string;
  type: string;
  dueDate: string;
  priority: string;
}): CreateCapaRequestDto {
  const description = input.description.trim();

  return {
    id: input.id,
    title: buildCapaTitleFromDescription(description),
    capaType:
      input.type.trim().toLowerCase() === "preventive"
        ? "Preventive"
        : "Corrective",
    priority: normalizePriority(input.priority),
    controlLevel: toApiControlLevel(input.controlLevel),
    description,
    userId: input.userId,
    incidentId: input.incidentId,
    rcaId: input.rcaId ?? 0,
    assignedId: input.assignedId ?? 0,
    dueDate: input.dueDate.trim() ? input.dueDate.trim() : "",
    isDrop: input.isDrop,
  };
}

export function buildCreateCapaRequest(input: {
  incidentId?: number;
  rcaId?: number | null;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}): CreateCapaRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  if (userId <= 0) {
    throw new Error("Sign in required to create a CAPA.");
  }

  const assignedId = parseOptionalUserId(input.owner) ?? 0;
  const incidentId =
    typeof input.incidentId === "number" && Number.isFinite(input.incidentId)
      ? Math.max(0, Math.trunc(input.incidentId))
      : 0;
  const rcaId =
    typeof input.rcaId === "number" && Number.isFinite(input.rcaId)
      ? Math.max(0, Math.trunc(input.rcaId))
      : 0;

  return buildCapaMutationPayload({
    id: 0,
    incidentId,
    userId,
    assignedId,
    rcaId,
    isDrop: false,
    controlLevel: input.controlLevel,
    description: input.description,
    type: input.type,
    dueDate: input.dueDate,
    priority: input.priority,
  });
}

export function buildUpdateCapaRequest(input: {
  capa: CapaItem;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}): CreateCapaRequestDto {
  const assignedId = parseOptionalUserId(input.owner) ?? input.capa.assignedId;

  return buildCapaMutationPayload({
    id: input.capa.numericId,
    incidentId: input.capa.incidentId,
    userId: input.capa.userId,
    assignedId,
    rcaId: input.capa.rcaId,
    isDrop: input.capa.isDrop,
    controlLevel: input.controlLevel,
    description: input.description,
    type: input.type,
    dueDate: input.dueDate,
    priority: input.priority,
  });
}

export function buildCreateCapaTaskRequest(input: {
  capaId: number;
  task: string;
  owner: string;
  dueDate: string;
  priority?: string;
}): CapaTaskRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  if (userId <= 0) {
    throw new Error("Sign in required to create a CAPA task.");
  }

  return {
    id: 0,
    capaId: input.capaId,
    task: input.task.trim(),
    priority: input.priority?.trim()
      ? normalizePriority(input.priority)
      : "Medium",
    ownerId: parseOptionalUserId(input.owner),
    dueDate: input.dueDate.trim() ? input.dueDate.trim() : null,
    userId,
  };
}

export function buildUpdateCapaTaskRequest(input: {
  id: number;
  capaId: number;
  task: string;
  owner: string;
  dueDate: string;
  priority?: string;
}): CapaTaskRequestDto {
  return {
    ...buildCreateCapaTaskRequest({
      capaId: input.capaId,
      task: input.task,
      owner: input.owner,
      dueDate: input.dueDate,
      priority: input.priority,
    }),
    id: input.id,
  };
}

export function buildUpdateCapaTaskStatusRequest(input: {
  taskId: number;
  status: CapaTaskStatus;
}): CapaTaskStatusRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;
  if (userId <= 0) {
    throw new Error("Sign in required to update a CAPA task status.");
  }

  return {
    id: input.taskId,
    status: input.status,
    userId,
  };
}

export function toCapaTaskStatusFromDetail(
  status: CapaDetailTaskStatus,
): CapaTaskStatus {
  switch (status) {
    case "Completed":
      return "Completed";
    case "In Progress":
      return "InProcess";
    default:
      return "NotStarted";
  }
}

/** Whether the assigner should review a completed CAPA before closing. */
export function capaNeedsManagerReview(item: CapaItem): boolean {
  return (
    item.taskStatus === "Completed" &&
    item.status !== "Verified" &&
    item.status !== "Closed"
  );
}

const DEFAULT_VERIFICATION_CHECKLIST = [
  "Action was implemented as described",
  "Evidence supports completion",
  "No new hazards introduced",
] as const;

export function buildCapaVerificationRequest(input: {
  capaId: number;
  effectiveness: CapaEffectiveness;
  notes?: string;
  checklist?: readonly { item: string; isChecked: boolean }[];
}): CapaVerificationRequestDto {
  const auth = getAuthContext();
  const userId = auth?.userId ?? 0;

  if (userId <= 0) {
    throw new Error("Sign in required to verify a CAPA.");
  }

  const checklist =
    input.checklist ??
    DEFAULT_VERIFICATION_CHECKLIST.map((item) => ({
      item,
      isChecked: true,
    }));

  return {
    capaId: input.capaId,
    userId,
    effectiveness: input.effectiveness,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    checklist,
  };
}

export function mapApiEffectivenessToFormValue(
  effectiveness: CapaEffectiveness,
): string {
  switch (effectiveness) {
    case "Partially Effective":
      return "partial";
    case "Not Effective":
      return "notEffective";
    case "Effective":
    default:
      return "effective";
  }
}

export function mapFormEffectivenessToApi(value: string): CapaEffectiveness {
  switch (value) {
    case "partial":
      return "Partially Effective";
    case "notEffective":
      return "Not Effective";
    case "effective":
    default:
      return "Effective";
  }
}

/** Prefill the verification FormBuilder from GET /api/v1/capas/{capaId}/verification. */
export function mapCapaVerificationDtoToFormValues(
  verification: CapaVerificationDto | null | undefined,
): FormValues {
  if (!verification) {
    return createCapaVerificationInitialValues();
  }

  const checkedLabels = new Set(
    (verification.checklist ?? [])
      .filter((item) => item.isChecked)
      .map((item) => item.item.trim().toLowerCase()),
  );

  const checklist = CAPA_VERIFICATION_CHECKLIST.filter((option) => {
    const label = option.label.toLowerCase();
    const value = option.value.toLowerCase();
    return (
      checkedLabels.has(label) ||
      checkedLabels.has(value) ||
      [...checkedLabels].some(
        (item) => item.includes(value) || label.includes(item),
      )
    );
  }).map((option) => option.value);

  return {
    ...createCapaVerificationInitialValues(),
    checklist,
    effectiveness: mapApiEffectivenessToFormValue(verification.effectiveness),
    notes: verification.notes?.trim() ?? "",
  };
}

/** Build POST checklist rows from FormBuilder checkbox selections. */
export function mapFormChecklistToVerificationItems(
  selected: unknown,
): { item: string; isChecked: boolean }[] {
  const selectedValues = Array.isArray(selected)
    ? selected.filter((value): value is string => typeof value === "string")
    : [];
  const selectedSet = new Set(selectedValues);

  return CAPA_VERIFICATION_CHECKLIST.map((option) => ({
    item: option.label,
    isChecked: selectedSet.has(option.value),
  }));
}

/** Re-submit CAPA metadata after verification so the record reflects closed state. */
export function buildVerifiedCapaUpdateRequest(
  capa: CapaItem,
): CreateCapaRequestDto {
  return buildCapaMutationPayload({
    id: capa.numericId,
    incidentId: capa.incidentId,
    userId: capa.userId,
    assignedId: capa.assignedId,
    rcaId: capa.rcaId,
    isDrop: capa.isDrop,
    controlLevel: capa.controlCategory,
    description: capa.description,
    type: capa.actionType,
    dueDate: capa.dueDate === "—" ? "" : capa.dueDate,
    priority: capa.priority,
  });
}

function detailPriorityFromDto(priority: string): CapaDetailPriority {
  const key = priority.trim().toLowerCase();
  if (key === "critical") return "Critical";
  if (key === "high") return "High";
  if (key === "low") return "Low";
  return "Medium";
}

function detailTaskStatusFromDto(
  status: CapaTaskStatus | null | undefined,
): CapaDetailTaskStatus {
  switch (status) {
    case "Completed":
      return "Completed";
    case "InProcess":
      return "In Progress";
    case "NotStarted":
    default:
      return "Not Started";
  }
}

/** Maps GET /api/v1/capas/{capaId}/tasks rows into detail-page task rows. */
export function mapCapaTaskDtoToDetailTask(
  task: CapaTaskDto,
  options?: Readonly<{ fallbackOwner?: string; fallbackDueDate?: string }>,
): CapaDetailTask {
  const dueDateRaw = task.dueDate ?? options?.fallbackDueDate;
  return {
    id: String(task.id),
    label: task.task.trim() || "Untitled task",
    owner:
      task.ownerName?.trim() ||
      options?.fallbackOwner ||
      (task.ownerId != null && task.ownerId > 0
        ? `User ${String(task.ownerId)}`
        : "—"),
    ownerId: task.ownerId != null && task.ownerId > 0 ? task.ownerId : null,
    dueDate: formatDueDate(dueDateRaw),
    dueDateIso: parseCapaApiDate(dueDateRaw) ?? "",
    priority: task.priority?.trim() || "Medium",
    status: detailTaskStatusFromDto(task.status),
  };
}

function formatCommentTimestamp(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—";
  }

  const raw = value.trim();
  const isoDate = parseCapaApiDate(raw);
  if (isoDate && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const timeMatch = /T?(\d{1,2}:\d{2})/.exec(raw);
    return timeMatch ? `${isoDate} ${timeMatch[1]}` : isoDate;
  }

  if (isoDate && isoDate !== raw) {
    return isoDate;
  }

  return raw;
}

/** Maps GET /api/v1/capas/{capaId}/comments rows into detail-page comment cards. */
export function mapCapaCommentDtoToDetailComment(
  comment: CapaCommentDto,
  index = 0,
  userNames?: ReadonlyMap<string, string>,
): CapaDetailComment {
  const id =
    comment.id != null && comment.id > 0
      ? String(comment.id)
      : `comment-${String(comment.capaId)}-${String(comment.userId)}-${String(index)}`;

  const author =
    comment.userName?.trim() ||
    (comment.userId > 0 ? userNameFor(userNames, comment.userId) : "Unknown");

  return {
    id,
    author,
    role: comment.title?.trim() || "Comment",
    timestamp: formatCommentTimestamp(comment.createdAt),
    body: comment.description.trim() || "—",
  };
}

/** Maps GET /api/v1/capas/{capaId}/attachments rows into detail attachment rows. */
export function mapCapaAttachmentDtoToDetailAttachment(
  file: CapaAttachmentItemDto,
  index = 0,
): CapaDetailAttachment {
  return {
    id: `att-${String(index + 1)}`,
    name: file.attachmentTitle.trim() || file.attachmentUrl.trim() || "File",
    meta: file.size?.trim() || file.attachmentUrl.trim() || "—",
  };
}

/** FormBuilder photo value: `title|||Uploaded by Name|||url` (or bare URL). */
export function capaAttachmentToFormValue(
  file: CapaAttachmentItemDto,
  userNames?: ReadonlyMap<string, string>,
): string {
  const url = file.attachmentUrl.trim();
  const title =
    file.attachmentTitle.trim() ||
    (url ? attachmentFileNameFromUrl(url) : "") ||
    "File";

  const uploader =
    file.userName?.trim() ||
    (file.userId != null && file.userId > 0
      ? userNameFor(userNames, file.userId)
      : "");
  const subtitle = uploader
    ? `Uploaded by ${uploader}`
    : file.size?.trim() || "";

  if (/^https?:\/\//i.test(url)) {
    return `${title}|||${subtitle}|||${url}`;
  }

  return `${title}|||${subtitle || "Attachment"}`;
}

function attachmentFileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").pop() ?? "";
    return decodeURIComponent(last.split("?")[0] ?? last) || "file";
  } catch {
    return url.split("/").pop()?.split("?")[0] || "file";
  }
}

/** Maps FormBuilder photo values into POST /UploadCapaAttachments items. */
export function formAttachmentValuesToDtos(
  value: unknown,
): CapaAttachmentItemDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== "string" || !entry.trim()) {
      return [];
    }

    const raw = entry.trim();

    if (/^https?:\/\//i.test(raw)) {
      return [
        {
          attachmentUrl: raw,
          attachmentTitle: attachmentFileNameFromUrl(raw),
          size: null,
        },
      ];
    }

    const parts = raw.split("|||");
    if (parts.length >= 3) {
      const url = parts[parts.length - 1]?.trim() ?? "";
      const title =
        parts[0]?.trim() ||
        (url ? attachmentFileNameFromUrl(url) : "") ||
        "File";
      if (/^https?:\/\//i.test(url)) {
        return [
          {
            attachmentUrl: url,
            attachmentTitle: title,
            size: null,
          },
        ];
      }
    }

    if (parts.length === 2) {
      const title = parts[0]?.trim() || "File";
      const meta = parts[1]?.trim() ?? "";
      if (/^https?:\/\//i.test(meta)) {
        return [
          {
            attachmentUrl: meta,
            attachmentTitle: title,
            size: null,
          },
        ];
      }
    }

    return [];
  });
}

/**
 * Prefer the stages the API sent; fall back to deriving them from the status
 * only when `lifecycleStages` is absent.
 */
function toDetailLifecycleStages(
  stages: readonly CapaLifecycleStageDto[] | undefined,
  statusLabel: string,
): readonly CapaDetailLifecycleStage[] {
  if (!stages || stages.length === 0) {
    return buildCapaLifecycleStages(statusLabel);
  }

  return stages.map((stage) => ({
    stage: stage.stage,
    isCompleted: stage.isCompleted,
    isCurrent: stage.isCurrent,
  }));
}

/**
 * Maps GET /api/v1/capas/{id} (+ tasks / attachments) into the detail page
 * view model.
 */
export function mapCapaApiToDetailRecord(
  dto: CapaDto,
  options?: Readonly<{
    currentUserId?: number;
    tasks?: readonly CapaTaskDto[];
    attachments?: readonly CapaAttachmentItemDto[];
    lifecycleStages?: readonly CapaLifecycleStageDto[];
  }>,
): CapaDetailRecord {
  const tasks = options?.tasks ?? [];
  const item = mapCapaDtoToItem(dto, {
    currentUserId: options?.currentUserId,
    tasks,
  });
  const statusLabel = formatCapaStatusDisplay(dto.status);
  const resolvedStatusLabel = statusLabel === "—" ? "Open" : statusLabel;
  const description = item.description;
  const proposedFromTasks = tasks
    .map((task, index) => {
      const label = task.task.trim();
      if (!label) return null;
      return `${String(index + 1)}. ${label}`;
    })
    .filter((line): line is string => line != null)
    .join(" ");

  return {
    id: String(dto.id),
    rcaId:
      typeof dto.rcaId === "number" &&
      Number.isFinite(dto.rcaId) &&
      dto.rcaId > 0
        ? dto.rcaId
        : null,
    controlLevel: normalizeControlLevel(dto.controlLevel),
    numericId: dto.id,
    incidentId: dto.incidentId,
    userId: dto.userId,
    assignedId: dto.assignedId ?? 0,
    code: item.code,
    title: item.title,
    priority: detailPriorityFromDto(item.priority),
    typeLabel: `${item.actionType} Action`,
    statusLabel: resolvedStatusLabel,
    owner: item.assignee,
    verifier: "—",
    dueDate: item.dueDate,
    daysLeftLabel: formatCapaDaysLeftLabel(dto.daysLeft, {
      dueDate: dto.dueDate,
      status: dto.status,
    }),
    source:
      dto.incidentId > 0
        ? `Incident · ${String(dto.incidentId)}`
        : item.controlCategory,
    module: dto.incidentId > 0 ? "Incident" : "CAPA",
    lifecycleStages: toDetailLifecycleStages(
      options?.lifecycleStages,
      resolvedStatusLabel,
    ),
    progress: item.progressPercent,
    problemStatement: description,
    rootCause: "Root cause analysis pending.",
    proposedAction: proposedFromTasks || "Action plan pending.",
    requiredResources: "To be confirmed.",
    expectedOutcome: "Hazard controlled and recurrence prevented.",
    tasks: tasks.map((task) =>
      mapCapaTaskDtoToDetailTask(task, {
        fallbackOwner: item.assignee,
        fallbackDueDate: dto.dueDate ?? undefined,
      }),
    ),
    comments: [],
    attachments: (options?.attachments ?? []).map((file, index) =>
      mapCapaAttachmentDtoToDetailAttachment(file, index),
    ),
  };
}
