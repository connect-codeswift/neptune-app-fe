import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type { CapaAttachmentRequestDto } from "@/dtos/req/capa-attachment-request.dto";
import type { CapaCommentRequestDto } from "@/dtos/req/capa-comment-request.dto";
import type { CapaVerificationRequestDto } from "@/dtos/req/capa-verification-request.dto";
import type { CapaAttachmentItemDto } from "@/dtos/res/capa-attachment-response.dto";
import type { CapaCommentDto } from "@/dtos/res/capa-comment-response.dto";
import type { GetCapaDashboardKpisResponseDto } from "@/dtos/res/capa-dashboard-kpis-response.dto";
import type { GetCapaLifecycleResponseDto } from "@/dtos/res/capa-lifecycle-response.dto";
import type { GetCapaOpenedClosedResponseDto } from "@/dtos/res/capa-opened-closed-response.dto";
import type { GetCapaAwaitingReviewResponseDto } from "@/dtos/res/capa-awaiting-review-response.dto";
import type { GetCapaWorkloadByOwnerResponseDto } from "@/dtos/res/capa-workload-by-owner-response.dto";
import type { CapaVerificationDto } from "@/dtos/res/capa-verification-response.dto";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import type { CapaTaskRequestDto } from "@/dtos/req/capa-task-request.dto";
import type { CapaTaskStatusRequestDto } from "@/dtos/req/capa-task-status-request.dto";
import type {
  CapaDetailDto,
  CapaLifecycleStageDto,
} from "@/dtos/res/capa-detail-response.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import http, { getAccessToken, HttpError } from "@/lib/axios";
import { parseCapaApiDate } from "@/lib/parse-capa-api-date";
import { normalizeCapaDashboardKpisDto } from "@/services/mappers/capa-dashboard-kpis.mapper";
import { normalizeCapaLifecycleDto } from "@/services/mappers/capa-lifecycle.mapper";
import { normalizeCapaOpenedClosedDto } from "@/services/mappers/capa-opened-closed.mapper";
import { normalizeCapaAwaitingReviewDto } from "@/services/mappers/capa-awaiting-review.mapper";
import { normalizeCapaWorkloadByOwnerDto } from "@/services/mappers/capa-workload-by-owner.mapper";

const CAPA_PATH = "/capas";
const CAPA_TASKS_PATH = "/capa-tasks";
const INCIDENTS_PATH = "/incidents";
const RCAS_PATH = "/rcas";
const CAPA_DASHBOARD_KPIS_PATH = "/capas/dashboard-kpis";
const CAPA_LIFECYCLE_PATH = "/capas/lifecycle";
const CAPA_OPENED_CLOSED_PATH = "/capas/opened-vs-closed";
const CAPA_WORKLOAD_BY_OWNER_PATH = "/capas/workload-by-owner";
const CAPA_AWAITING_REVIEW_PATH = "/capas/awaiting-effectiveness-review";

export type GetCapasRequest = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  capaType?: string;
  priority?: string;
}>;

export type GetCapasResponse = Readonly<{
  items: CapaDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

function asString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function coerceCapaDto(raw: Record<string, unknown>): CapaDto | null {
  const id = asNumber(readProp(raw, "id", "Id"));
  if (id == null) {
    return null;
  }

  const incidentId = asNumber(readProp(raw, "incidentId", "IncidentId")) ?? 0;
  const userId =
    asNumber(readProp(raw, "userId", "UserId")) ??
    asNumber(readProp(raw, "assignedId", "AssignedId")) ??
    0;
  const title = asString(readProp(raw, "title", "Title"));
  const description = asString(readProp(raw, "description", "Description"));
  const capaType = asString(readProp(raw, "capaType", "CapaType"));
  const controlLevel = asString(readProp(raw, "controlLevel", "ControlLevel"));
  const priority = asString(readProp(raw, "priority", "Priority"));
  const fallbackLabel = `CAPA-${String(id)}`;
  const resolvedDescription =
    description?.trim() || title?.trim() || fallbackLabel;
  const resolvedTitle = title?.trim() || description?.trim() || fallbackLabel;

  const progressPercent =
    asNumber(readProp(raw, "progressPercent", "ProgressPercent")) ??
    asNumber(readProp(raw, "progressPercentage", "ProgressPercentage")) ??
    asNumber(readProp(raw, "progress", "Progress"));

  return {
    id,
    incidentId,
    userId,
    title: resolvedTitle,
    description: resolvedDescription,
    capaType: capaType?.trim() || "Corrective",
    controlLevel: controlLevel?.trim() || "Administrative Controls",
    priority: priority?.trim() || "Medium",
    assignedId: asNumber(readProp(raw, "assignedId", "AssignedId")) ?? null,
    rcaId: asNumber(readProp(raw, "rcaId", "RcaId")) ?? null,
    dueDate: asString(readProp(raw, "dueDate", "DueDate")) ?? null,
    isDrop: asBoolean(readProp(raw, "isDrop", "IsDrop")) ?? false,
    status: asString(readProp(raw, "status", "Status")) ?? null,
    daysLeft: asNumber(readProp(raw, "daysLeft", "DaysLeft")) ?? null,
    progressPercent: progressPercent ?? null,
    progress: asNumber(readProp(raw, "progress", "Progress")) ?? null,
    progressPercentage:
      asNumber(readProp(raw, "progressPercentage", "ProgressPercentage")) ??
      null,
    assigneeName:
      asString(
        readProp(
          raw,
          "assigneeName",
          "AssigneeName",
          "assignedName",
          "AssignedName",
          "assignee",
          "Assignee",
        ),
      ) ?? null,
    assignedName:
      asString(readProp(raw, "assignedName", "AssignedName")) ?? null,
    ownerName:
      asString(readProp(raw, "ownerName", "OwnerName", "owner", "Owner")) ??
      null,
    sourceInfo: asString(readProp(raw, "sourceInfo", "SourceInfo")) ?? null,
    code: asString(readProp(raw, "code", "Code")) ?? null,
    capaCode: asString(readProp(raw, "capaCode", "CapaCode")) ?? null,
  };
}

function readApiEnvelopeMessage(data: unknown): string {
  if (!isRecord(data)) {
    return "";
  }
  const message = data.message ?? data.Message;
  return typeof message === "string" ? message : "";
}

/** Backend returns 400 when an incident has zero linked CAPAs. Treat as empty list. */
function isEmptyIncidentCapaListError(error: unknown): boolean {
  if (!(error instanceof HttpError) || error.status !== 400) {
    return false;
  }

  const message = readApiEnvelopeMessage(error.data).toLowerCase();
  return message.includes("no capas found");
}

function asCapaArray(value: unknown): CapaDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceCapaDto(item))
    .filter((item): item is CapaDto => item != null);
}

function unwrapPayload(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  return (
    data.dataModel ??
    data.DataModel ??
    data.data ??
    data.Data ??
    data.result ??
    data.Result ??
    data
  );
}

function normalizeCapaList(data: unknown): CapaDto[] {
  const payload = unwrapPayload(data);

  if (Array.isArray(payload)) {
    return asCapaArray(payload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  return asCapaArray(
    payload.data ??
      payload.Data ??
      payload.items ??
      payload.Items ??
      payload.capas ??
      payload.Capas ??
      payload.result ??
      payload.Result,
  );
}

function normalizeGetCapasResponse(
  data: unknown,
  request: Readonly<{
    pageNumber: number;
    pageSize: number;
  }>,
): GetCapasResponse {
  if (Array.isArray(data)) {
    const items = asCapaArray(data);
    return {
      items,
      totalCount: items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  const root = isRecord(data) ? data : null;
  const dataModelRaw = root
    ? (root.dataModel ?? root.DataModel ?? undefined)
    : undefined;

  if (Array.isArray(dataModelRaw)) {
    const items = asCapaArray(dataModelRaw);
    const totalCountRaw =
      root &&
      (root.totalRecords ??
        root.TotalRecords ??
        root.totalCount ??
        root.TotalCount ??
        root.total ??
        root.count);
    return {
      items,
      totalCount:
        typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
          ? totalCountRaw
          : items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  const dataModel = isRecord(dataModelRaw) ? dataModelRaw : null;
  const nestedDataRaw = root
    ? (root.data ?? root.Data ?? undefined)
    : undefined;
  const nestedData = isRecord(nestedDataRaw) ? nestedDataRaw : null;
  const page = dataModel ?? nestedData;

  const items = asCapaArray(
    Array.isArray(nestedDataRaw)
      ? nestedDataRaw
      : page
        ? (page.data ??
          page.Data ??
          page.items ??
          page.Items ??
          page.capas ??
          page.Capas ??
          page.result ??
          page.Result)
        : (root?.items ?? root?.Items ?? root?.capas ?? root?.Capas),
  );

  const totalCountRaw =
    (page &&
      (page.totalRecords ??
        page.TotalRecords ??
        page.totalCount ??
        page.TotalCount ??
        page.total ??
        page.count)) ??
    (root &&
      (root.totalRecords ??
        root.TotalRecords ??
        root.totalCount ??
        root.TotalCount ??
        root.total ??
        root.count));

  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw =
    (page && (page.pageNumber ?? page.PageNumber)) ??
    (root && (root.pageNumber ?? root.PageNumber));
  const pageSizeRaw =
    (page && (page.pageSize ?? page.PageSize)) ??
    (root && (root.pageSize ?? root.PageSize));

  return {
    items,
    totalCount,
    pageNumber:
      typeof pageNumberRaw === "number" ? pageNumberRaw : request.pageNumber,
    pageSize: typeof pageSizeRaw === "number" ? pageSizeRaw : request.pageSize,
  };
}

function normalizeCapaDto(data: unknown): CapaDto | null {
  const payload = unwrapPayload(data);

  if (isRecord(payload)) {
    const single = coerceCapaDto(payload);
    if (single) {
      return single;
    }
  }

  const list = normalizeCapaList(data);
  return list[0] ?? null;
}

function normalizeCapaTaskDueDate(
  value: string | null | undefined,
): string | null {
  return parseCapaApiDate(value);
}

function coerceCapaTaskDto(raw: Record<string, unknown>): CapaTaskDto | null {
  const id = asNumber(readProp(raw, "id", "Id"));
  const capaId = asNumber(readProp(raw, "capaId", "CapaId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const task = asString(readProp(raw, "task", "Task"));
  const statusRaw = asString(readProp(raw, "status", "Status"));

  if (id == null || capaId == null || userId == null || !task?.trim()) {
    return null;
  }

  const status =
    statusRaw === "NotStarted" ||
    statusRaw === "InProcess" ||
    statusRaw === "Completed"
      ? statusRaw
      : null;

  const dueDateRaw = asString(readProp(raw, "dueDate", "DueDate"));

  return {
    id,
    capaId,
    userId,
    task: task.trim(),
    ownerId: asNumber(readProp(raw, "ownerId", "OwnerId")) ?? null,
    ownerName: asString(readProp(raw, "ownerName", "OwnerName")) ?? null,
    dueDate: normalizeCapaTaskDueDate(dueDateRaw),
    status,
    priority: asString(readProp(raw, "priority", "Priority")) ?? null,
    createdAt: asString(readProp(raw, "createdAt", "CreatedAt")) ?? null,
  };
}

function asCapaTaskArray(value: unknown): CapaTaskDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceCapaTaskDto(item))
    .filter((item): item is CapaTaskDto => item != null);
}

function normalizeCapaTaskList(data: unknown): CapaTaskDto[] {
  const payload = unwrapPayload(data);

  if (Array.isArray(payload)) {
    return asCapaTaskArray(payload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  return asCapaTaskArray(
    payload.data ??
      payload.Data ??
      payload.items ??
      payload.Items ??
      payload.tasks ??
      payload.Tasks,
  );
}

function normalizeCapaTaskDto(data: unknown): CapaTaskDto | null {
  const payload = unwrapPayload(data);

  if (isRecord(payload)) {
    const single = coerceCapaTaskDto(payload);
    if (single) {
      return single;
    }
  }

  return normalizeCapaTaskList(data)[0] ?? null;
}

function coerceCapaCommentDto(
  raw: Record<string, unknown>,
): CapaCommentDto | null {
  const capaId = asNumber(readProp(raw, "capaId", "CapaId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const assignedId = asNumber(readProp(raw, "assignedId", "AssignedId"));
  const description = asString(readProp(raw, "description", "Description"));

  if (
    capaId == null ||
    userId == null ||
    assignedId == null ||
    !description?.trim()
  ) {
    return null;
  }

  return {
    id: asNumber(readProp(raw, "id", "Id")) ?? null,
    capaId,
    userId,
    assignedId,
    description: description.trim(),
    title: asString(readProp(raw, "title", "Title")) ?? null,
    createdAt:
      asString(
        readProp(
          raw,
          "createdAt",
          "CreatedAt",
          "createdOn",
          "CreatedOn",
          "dateCreated",
          "DateCreated",
        ),
      ) ?? null,
    userName:
      asString(
        readProp(
          raw,
          "userName",
          "UserName",
          "authorName",
          "AuthorName",
          "createdByName",
          "CreatedByName",
        ),
      ) ?? null,
    assignedName:
      asString(
        readProp(
          raw,
          "assignedName",
          "AssignedName",
          "assigneeName",
          "AssigneeName",
        ),
      ) ?? null,
  };
}

function asCapaCommentArray(value: unknown): CapaCommentDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceCapaCommentDto(item))
    .filter((item): item is CapaCommentDto => item != null);
}

function normalizeCapaCommentList(data: unknown): CapaCommentDto[] {
  const payload = unwrapPayload(data);

  if (Array.isArray(payload)) {
    return asCapaCommentArray(payload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  return asCapaCommentArray(
    payload.data ??
      payload.Data ??
      payload.items ??
      payload.Items ??
      payload.comments ??
      payload.Comments ??
      payload.result ??
      payload.Result,
  );
}

function normalizeCapaCommentDto(data: unknown): CapaCommentDto | null {
  const payload = unwrapPayload(data);

  if (isRecord(payload)) {
    const single = coerceCapaCommentDto(payload);
    if (single) {
      return single;
    }
  }

  return normalizeCapaCommentList(data)[0] ?? null;
}

function coerceCapaAttachmentItem(
  raw: Record<string, unknown>,
): CapaAttachmentItemDto | null {
  const attachmentUrl = asString(
    readProp(raw, "attachmentUrl", "AttachmentUrl", "url", "Url"),
  );
  const attachmentTitle = asString(
    readProp(
      raw,
      "attachmentTitle",
      "AttachmentTitle",
      "title",
      "Title",
      "name",
      "Name",
    ),
  );

  if (!attachmentUrl?.trim()) {
    return null;
  }

  const url = attachmentUrl.trim();
  const title =
    attachmentTitle?.trim() || url.split("/").pop()?.split("?")[0] || "File";

  return {
    id: asNumber(readProp(raw, "id", "Id")) ?? null,
    capaId: asNumber(readProp(raw, "capaId", "CapaId")) ?? null,
    userId: asNumber(readProp(raw, "userId", "UserId")) ?? null,
    attachmentUrl: url,
    attachmentTitle: title,
    size: asString(readProp(raw, "size", "Size")) ?? null,
    createdAt:
      asString(
        readProp(raw, "createdAt", "CreatedAt", "createdOn", "CreatedOn"),
      ) ?? null,
    userName:
      asString(
        readProp(
          raw,
          "userName",
          "UserName",
          "uploadedByName",
          "UploadedByName",
          "fullName",
          "FullName",
        ),
      ) ?? null,
  };
}

function normalizeCapaAttachmentList(data: unknown): CapaAttachmentItemDto[] {
  const payload = unwrapPayload(data);

  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => coerceCapaAttachmentItem(item))
      .filter((item): item is CapaAttachmentItemDto => item != null);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const nested =
    payload.attachments ??
    payload.Attachments ??
    payload.data ??
    payload.Data ??
    payload.items ??
    payload.Items;

  if (Array.isArray(nested)) {
    return nested
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => coerceCapaAttachmentItem(item))
      .filter((item): item is CapaAttachmentItemDto => item != null);
  }

  return [];
}

function coerceCapaVerificationDto(
  raw: Record<string, unknown>,
): CapaVerificationDto | null {
  const capaId = asNumber(readProp(raw, "capaId", "CapaId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const effectivenessRaw = asString(
    readProp(raw, "effectiveness", "Effectiveness"),
  );

  if (capaId == null || userId == null || !effectivenessRaw?.trim()) {
    return null;
  }

  const effectiveness = effectivenessRaw.trim() as CapaEffectiveness;
  if (
    effectiveness !== "Effective" &&
    effectiveness !== "Partially Effective" &&
    effectiveness !== "Not Effective"
  ) {
    return null;
  }

  const checklistRaw =
    readProp(raw, "checklist", "Checklist") ??
    readProp(raw, "checkList", "CheckList");

  const checklist = Array.isArray(checklistRaw)
    ? checklistRaw
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => {
          const itemText = asString(readProp(item, "item", "Item"));
          if (!itemText?.trim()) {
            return null;
          }
          return {
            item: itemText.trim(),
            isChecked:
              asBoolean(readProp(item, "isChecked", "IsChecked")) ?? false,
          };
        })
        .filter(
          (item): item is { item: string; isChecked: boolean } => item != null,
        )
    : null;

  return {
    capaId,
    userId,
    effectiveness,
    notes: asString(readProp(raw, "notes", "Notes")) ?? null,
    checklist,
    verifiedAt:
      asString(
        readProp(raw, "verifiedAt", "VerifiedAt", "createdAt", "CreatedAt"),
      ) ?? null,
    verifiedByName:
      asString(
        readProp(
          raw,
          "verifiedByName",
          "VerifiedByName",
          "userName",
          "UserName",
        ),
      ) ?? null,
  };
}

function normalizeCapaVerificationDto(
  data: unknown,
): CapaVerificationDto | null {
  const payload = unwrapPayload(data);

  if (isRecord(payload)) {
    const single = coerceCapaVerificationDto(payload);
    if (single) {
      return single;
    }
  }

  if (Array.isArray(payload)) {
    const first = payload
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => coerceCapaVerificationDto(item))
      .find((item): item is CapaVerificationDto => item != null);
    return first ?? null;
  }

  return null;
}

/**
 * GET /api/v1/capas/dashboard-kpis
 * Header: Authorization Bearer (required)
 */
export async function getCapaDashboardKpis(): Promise<GetCapaDashboardKpisResponseDto> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA dashboard KPIs.");
  }

  const { data } = await http.get<unknown>(CAPA_DASHBOARD_KPIS_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": false,
    },
  });

  const rawModel = isRecord(data)
    ? (data.dataModel ?? data.DataModel ?? data)
    : data;

  const envelope = isRecord(data) ? data : {};

  return {
    isError: Boolean(envelope.isError ?? false),
    success: Boolean(envelope.success ?? true),
    statusCode:
      typeof envelope.statusCode === "number" ? envelope.statusCode : 200,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "CAPA dashboard KPIs fetched successfully",
    dataModel: normalizeCapaDashboardKpisDto(rawModel),
    errorDetails: envelope.errorDetails ?? null,
  };
}

/**
 * GET /api/v1/capas/lifecycle
 * Header: Authorization Bearer (required)
 */
export async function getCapaLifecycle(): Promise<GetCapaLifecycleResponseDto> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA lifecycle.");
  }

  const { data } = await http.get<unknown>(CAPA_LIFECYCLE_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": false,
    },
  });

  const rawModel = isRecord(data)
    ? (data.dataModel ?? data.DataModel ?? data)
    : data;

  const envelope = isRecord(data) ? data : {};

  return {
    isError: Boolean(envelope.isError ?? false),
    success: Boolean(envelope.success ?? true),
    statusCode:
      typeof envelope.statusCode === "number" ? envelope.statusCode : 200,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "CAPA lifecycle data fetched successfully",
    dataModel: normalizeCapaLifecycleDto(rawModel),
    errorDetails: envelope.errorDetails ?? null,
  };
}

/**
 * GET /api/v1/capas/opened-vs-closed
 * Header: Authorization Bearer (required)
 */
export async function getCapaOpenedVsClosed(): Promise<GetCapaOpenedClosedResponseDto> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA opened vs closed.");
  }

  const { data } = await http.get<unknown>(CAPA_OPENED_CLOSED_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": false,
    },
  });

  const rawModel = isRecord(data)
    ? (data.dataModel ?? data.DataModel ?? data)
    : data;

  const envelope = isRecord(data) ? data : {};

  return {
    isError: Boolean(envelope.isError ?? false),
    success: Boolean(envelope.success ?? true),
    statusCode:
      typeof envelope.statusCode === "number" ? envelope.statusCode : 200,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "CAPA opened vs closed data fetched successfully",
    dataModel: normalizeCapaOpenedClosedDto(rawModel),
    errorDetails: envelope.errorDetails ?? null,
  };
}

/**
 * GET /api/v1/capas/workload-by-owner
 * Header: Authorization Bearer (required)
 */
export async function getCapaWorkloadByOwner(): Promise<GetCapaWorkloadByOwnerResponseDto> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA workload by owner.");
  }

  const { data } = await http.get<unknown>(CAPA_WORKLOAD_BY_OWNER_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": false,
    },
  });

  const rawModel = isRecord(data)
    ? (data.dataModel ?? data.DataModel ?? data)
    : data;

  const envelope = isRecord(data) ? data : {};

  return {
    isError: Boolean(envelope.isError ?? false),
    success: Boolean(envelope.success ?? true),
    statusCode:
      typeof envelope.statusCode === "number" ? envelope.statusCode : 200,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "CAPA workload by owner data fetched successfully",
    dataModel: normalizeCapaWorkloadByOwnerDto(rawModel),
    errorDetails: envelope.errorDetails ?? null,
  };
}

/**
 * GET /api/v1/capas/awaiting-effectiveness-review
 * Every CAPA sitting in `Pending Verification` — no paging, oldest first.
 * Roles: Ehs_Director, Ehs_Lead, Ehs_Manager, Supervisor. Permission: CAPA.Dashboard.View.
 */
export async function getCapaAwaitingEffectivenessReview(): Promise<GetCapaAwaitingReviewResponseDto> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPAs awaiting review.");
  }

  const { data } = await http.get<unknown>(CAPA_AWAITING_REVIEW_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": false,
    },
  });

  const rawModel = isRecord(data)
    ? (data.dataModel ?? data.DataModel ?? data)
    : data;

  const envelope = isRecord(data) ? data : {};

  return {
    isError: Boolean(envelope.isError ?? false),
    success: Boolean(envelope.success ?? true),
    statusCode:
      typeof envelope.statusCode === "number" ? envelope.statusCode : 200,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "CAPAs awaiting effectiveness review fetched successfully",
    dataModel: normalizeCapaAwaitingReviewDto(rawModel),
    errorDetails: envelope.errorDetails ?? null,
  };
}

/**
 * GET /CAPA
 * Query: PageNumber (default 1), PageSize (default 10),
 * Search?, Status?, CapaType?, Priority?
 * All / empty = omit the param. Header: Authorization Bearer (required)
 */
export async function getCapas(
  request: GetCapasRequest = {},
): Promise<GetCapasResponse> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPAs.");
  }

  const pageNumber = request.pageNumber ?? 1;
  const pageSize = request.pageSize ?? 10;
  const search = request.search?.trim() ?? "";
  const status = request.status?.trim() ?? "";
  const capaType = request.capaType?.trim() ?? "";
  const priority = request.priority?.trim() ?? "";

  const { data } = await http.get<unknown>(CAPA_PATH, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      ...(search ? { Search: search } : {}),
      ...(status ? { Status: status } : {}),
      ...(capaType ? { CapaType: capaType } : {}),
      ...(priority ? { Priority: priority } : {}),
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Avoid sending JSON content-type on a body-less GET (some hosts 403 it).
      "Content-Type": false,
    },
  });

  return normalizeGetCapasResponse(data, {
    pageNumber,
    pageSize,
  });
}

/**
 * GET /api/v1/incidents/{incidentId}/capas
 * Returns CAPAs linked to an incident (Bearer auth).
 */
export async function getCapasByIncidentId(incidentId: number) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPAs.");
  }

  try {
    const { data } = await http.get<unknown>(
      `${INCIDENTS_PATH}/${encodeURIComponent(String(incidentId))}/capas`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return normalizeCapaList(data);
  } catch (error) {
    if (isEmptyIncidentCapaListError(error)) {
      return [];
    }
    throw error;
  }
}

/** POST /api/v1/capas */
export async function createCapa(payload: CreateCapaRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to create a CAPA.");
  }

  const { data } = await http.post<unknown>(CAPA_PATH, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeCapaDto(data);
}

/**
 * PUT /api/v1/capas/{id} — update an existing linked CAPA.
 * The id moved from the request body to the path in the v1 rename; the body is
 * otherwise unchanged (the backend now ignores the body `id`).
 */
export async function updateCapa(payload: CreateCapaRequestDto) {
  if (!Number.isFinite(payload.id) || payload.id <= 0) {
    throw new Error("CAPA id is required to update.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update a CAPA.");
  }

  const { data } = await http.put<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(payload.id))}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaDto(data);
}

/** GET /api/v1/capas/{id} */
export async function getCapaById(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA details.");
  }

  const { data } = await http.get<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return normalizeCapaDto(data);
}

function coerceCapaLifecycleStage(
  raw: Record<string, unknown>,
): CapaLifecycleStageDto | null {
  const stage = asString(readProp(raw, "stage", "Stage"))?.trim();
  if (!stage) {
    return null;
  }

  return {
    stage,
    stageIndex: asNumber(readProp(raw, "stageIndex", "StageIndex")) ?? 0,
    isCompleted:
      asBoolean(readProp(raw, "isCompleted", "IsCompleted")) ?? false,
    isCurrent: asBoolean(readProp(raw, "isCurrent", "IsCurrent")) ?? false,
  };
}

function asCapaLifecycleStageArray(value: unknown): CapaLifecycleStageDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceCapaLifecycleStage(item))
    .filter((item): item is CapaLifecycleStageDto => item != null)
    .sort((a, b) => a.stageIndex - b.stageIndex);
}

/**
 * GET /api/v1/capas/{id}/detail
 * Superset of GET /api/v1/capas/{id}: adds the lifecycle stepper and the task
 * roll-up. The plain CAPA fields are coerced by the same helper the list uses.
 */
export async function getCapaDetail(
  capaId: number,
): Promise<CapaDetailDto | null> {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA details.");
  }

  const { data } = await http.get<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}/detail`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = unwrapPayload(data);
  if (!isRecord(payload)) {
    return null;
  }

  const capa = coerceCapaDto(payload);
  if (!capa) {
    return null;
  }

  return {
    capa,
    lifecycleStages: asCapaLifecycleStageArray(
      readProp(payload, "lifecycleStages", "LifecycleStages"),
    ),
    totalTasks: asNumber(readProp(payload, "totalTasks", "TotalTasks")) ?? null,
    completedTasks:
      asNumber(readProp(payload, "completedTasks", "CompletedTasks")) ?? null,
  };
}

/** GET /api/v1/capas/{capaId}/tasks */
export async function getCapaTasksByCapaId(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return [];
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA tasks.");
  }

  const { data } = await http.get<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return normalizeCapaTaskList(data);
}

export type GetCapaCommentsRequest = Readonly<{
  capaId: number;
  userId?: number;
  assignedId?: number;
}>;

/** GET /api/v1/capas/{capaId}/comments?userId=&assignedId= — capaId moved to the path. */
export async function getCapaComments(request: GetCapaCommentsRequest) {
  const capaId = request.capaId;
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return [];
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA comments.");
  }

  const userId =
    typeof request.userId === "number" &&
    Number.isFinite(request.userId) &&
    request.userId > 0
      ? Math.trunc(request.userId)
      : 0;
  const assignedId =
    typeof request.assignedId === "number" &&
    Number.isFinite(request.assignedId) &&
    request.assignedId > 0
      ? Math.trunc(request.assignedId)
      : 0;

  const { data } = await http.get<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(Math.trunc(capaId)))}/comments`,
    {
      params: {
        ...(userId > 0 ? { userId } : {}),
        ...(assignedId > 0 ? { assignedId } : {}),
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": false,
      },
    },
  );
  return normalizeCapaCommentList(data);
}

/** POST /api/v1/capas/{capaId}/comments — capaId moved to the path. */
export async function createCapaComment(payload: CapaCommentRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to post a CAPA comment.");
  }

  const { data } = await http.post<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(payload.capaId))}/comments`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaCommentDto(data);
}

/** POST /api/v1/capas/{capaId}/tasks — capaId moved to the path. */
export async function createCapaTask(payload: CapaTaskRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to create a CAPA task.");
  }

  const { data } = await http.post<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(payload.capaId))}/tasks`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaTaskDto(data);
}

/**
 * PUT /api/v1/capa-tasks/{taskId}
 * The task id moved from the request body to the path; the body is unchanged.
 */
export async function updateCapaTask(payload: CapaTaskRequestDto) {
  if (!Number.isFinite(payload.id) || payload.id <= 0) {
    throw new Error("CAPA task id is required to update.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update a CAPA task.");
  }

  const { data } = await http.put<unknown>(
    `${CAPA_TASKS_PATH}/${encodeURIComponent(String(payload.id))}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaTaskDto(data);
}

/** PATCH /api/v1/capa-tasks/{taskId}/status — task id moved to the path. */
export async function updateCapaTaskStatus(payload: CapaTaskStatusRequestDto) {
  if (!Number.isFinite(payload.id) || payload.id <= 0) {
    throw new Error("CAPA task id is required to update status.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update a CAPA task status.");
  }

  const { data } = await http.patch<unknown>(
    `${CAPA_TASKS_PATH}/${encodeURIComponent(String(payload.id))}/status`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaTaskDto(data);
}

/** DELETE /api/v1/capa-tasks/{id} — soft-drop a linked task (was `PATCH .../Drop/{id}`). */
export async function deleteCapaTask(taskId: number) {
  if (!Number.isFinite(taskId) || taskId <= 0) {
    throw new Error("CAPA task id is required to delete.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to delete a CAPA task.");
  }

  const { data } = await http.delete<unknown>(
    `${CAPA_TASKS_PATH}/${encodeURIComponent(String(taskId))}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
}

/** DELETE /api/v1/capas/{id} — soft-drop a CAPA (was `PATCH /CAPA/Drop/{id}`). */
export async function dropCapa(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    throw new Error("CAPA id is required to drop.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to drop a CAPA.");
  }

  const { data } = await http.delete<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
}

/**
 * POST /api/v1/capas/{capaId}/request-verification — hands a finished CAPA to whoever
 * signs it off, moving it from `Completed` to `Pending Verification`.
 *
 * This is the path for someone who does the work but cannot close it: the API accepts it
 * on `CAPA.Update`, which a Worker holds, while `Verify & Close` needs `CAPA.Verify`,
 * which they do not. Rejected with 400 from any status other than `Completed`, so the
 * button must only appear once every task is done.
 */
export async function requestCapaVerification(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    throw new Error("CAPA id is required to request verification.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to request verification.");
  }

  const { data } = await http.post<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}/request-verification`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
}

/*
 * CAPA reopen is intentionally absent.
 *
 * There is no capa-level status write in the backend: `ICapaService` /
 * `CapaService` have no method behind `PATCH /CAPA/Capa/{id}/status`, and
 * route-map.md has no row for it — the design doc listed it, the code never
 * implemented it, so it has been 404ing in production. The only real status
 * writes are `PATCH /api/v1/capa-tasks/{taskId}/status` and
 * `POST /api/v1/capas/{id}/request-verification`.
 *
 * Restore `reopenCapa` here, and the Reopen button in `CapaDetailHeader`, once
 * the backend actually serves it.
 */

/** GET /api/v1/capas/{capaId}/attachments */
export async function getCapaAttachmentsByCapaId(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return [];
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA attachments.");
  }

  const { data } = await http.get<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(capaId))}/attachments`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return normalizeCapaAttachmentList(data);
}

/** POST /api/v1/capas/{capaId}/attachments — capaId moved to the path. */
export async function uploadCapaAttachments(payload: CapaAttachmentRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to upload CAPA attachments.");
  }

  const { data } = await http.post<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(payload.capaId))}/attachments`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaAttachmentList(data);
}

/** Backend returns 400/404 when a CAPA has no verification yet. */
function isNoVerificationFoundError(error: unknown): boolean {
  if (!(error instanceof HttpError)) {
    return false;
  }

  if (error.status !== 404 && error.status !== 400) {
    return false;
  }

  const message = (
    readApiEnvelopeMessage(error.data) ||
    error.message ||
    ""
  ).toLowerCase();
  return message.includes("no verification found");
}

/** GET /api/v1/capas/{capaId}/verification */
export async function getCapaVerificationByCapaId(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA verification.");
  }

  try {
    const { data } = await http.get<unknown>(
      `${CAPA_PATH}/${encodeURIComponent(String(capaId))}/verification`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const verification = normalizeCapaVerificationDto(data);
    if (verification) {
      return verification;
    }

    const message = readApiEnvelopeMessage(data).toLowerCase();
    if (message.includes("no verification found")) {
      return null;
    }

    return null;
  } catch (error) {
    if (
      isNoVerificationFoundError(error) ||
      (error instanceof HttpError && error.status === 404)
    ) {
      return null;
    }
    throw error;
  }
}

/** POST /api/v1/capas/{capaId}/verification — capaId moved to the path. */
export async function submitCapaVerification(
  payload: CapaVerificationRequestDto,
) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to verify a CAPA.");
  }

  const { data } = await http.post<unknown>(
    `${CAPA_PATH}/${encodeURIComponent(String(payload.capaId))}/verification`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaVerificationDto(data);
}
