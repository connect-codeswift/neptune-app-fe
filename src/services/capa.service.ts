import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type { CapaTaskRequestDto } from "@/dtos/req/capa-task-request.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import http, { getAccessToken, HttpError } from "@/lib/axios";

const CAPA_CREATE_PATH = "/CAPA/Capa";
const CAPA_BY_INCIDENT_PATH = "/CAPA/Incident";
const CAPA_DROP_PATH = "/CAPA/Drop";
const CAPA_TASK_PATH = "/CAPA/Task";
const CAPA_TASKS_BY_CAPA_PATH = "/CAPA/Tasks";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
  const incidentId = asNumber(readProp(raw, "incidentId", "IncidentId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const title = asString(readProp(raw, "title", "Title"));
  const description = asString(
    readProp(raw, "description", "Description"),
  );
  const capaType = asString(readProp(raw, "capaType", "CapaType"));
  const controlLevel = asString(
    readProp(raw, "controlLevel", "ControlLevel"),
  );
  const priority = asString(readProp(raw, "priority", "Priority"));
  const resolvedDescription = description ?? title;
  const resolvedTitle = title ?? description;

  if (
    id == null ||
    incidentId == null ||
    userId == null ||
    !resolvedDescription ||
    !resolvedTitle ||
    !capaType ||
    !controlLevel ||
    !priority
  ) {
    return null;
  }

  const progressPercent =
    asNumber(readProp(raw, "progressPercent", "ProgressPercent")) ??
    asNumber(readProp(raw, "progress", "Progress"));

  return {
    id,
    incidentId,
    userId,
    title: resolvedTitle,
    description: resolvedDescription,
    capaType,
    controlLevel,
    priority,
    assignedId:
      asNumber(readProp(raw, "assignedId", "AssignedId")) ?? null,
    rcaId: asNumber(readProp(raw, "rcaId", "RcaId")) ?? null,
    dueDate: asString(readProp(raw, "dueDate", "DueDate")) ?? null,
    isDrop: asBoolean(readProp(raw, "isDrop", "IsDrop")) ?? false,
    status: asString(readProp(raw, "status", "Status")) ?? null,
    progressPercent: progressPercent ?? null,
    progress: asNumber(readProp(raw, "progress", "Progress")) ?? null,
    assigneeName:
      asString(
        readProp(raw, "assigneeName", "AssigneeName", "assignee", "Assignee"),
      ) ?? null,
    ownerName:
      asString(readProp(raw, "ownerName", "OwnerName", "owner", "Owner")) ??
      null,
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

function coerceCapaTaskDto(raw: Record<string, unknown>): CapaTaskDto | null {
  const id = asNumber(readProp(raw, "id", "Id"));
  const capaId = asNumber(readProp(raw, "capaId", "CapaId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const task = asString(readProp(raw, "task", "Task"));

  if (id == null || capaId == null || userId == null || !task?.trim()) {
    return null;
  }

  return {
    id,
    capaId,
    userId,
    task: task.trim(),
    ownerId: asNumber(readProp(raw, "ownerId", "OwnerId")) ?? null,
    dueDate: asString(readProp(raw, "dueDate", "DueDate")) ?? null,
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

/**
 * GET /CAPA/Incident/{incidentId}
 * Returns CAPAs linked to an incident (Bearer auth).
 */
export async function getCapasByIncidentId(incidentId: number) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPAs.");
  }

  try {
    const { data } = await http.get<unknown>(
      `${CAPA_BY_INCIDENT_PATH}/${encodeURIComponent(String(incidentId))}`,
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

/** POST /CAPA/Capa */
export async function createCapa(payload: CreateCapaRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to create a CAPA.");
  }

  const { data } = await http.post<unknown>(CAPA_CREATE_PATH, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeCapaDto(data);
}

/** PUT /CAPA/Capa — update an existing linked CAPA */
export async function updateCapa(payload: CreateCapaRequestDto) {
  if (!Number.isFinite(payload.id) || payload.id <= 0) {
    throw new Error("CAPA id is required to update.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update a CAPA.");
  }

  const { data } = await http.put<unknown>(CAPA_CREATE_PATH, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeCapaDto(data);
}

/** GET /CAPA/Tasks/{capaId} */
export async function getCapaTasksByCapaId(capaId: number) {
  if (!Number.isFinite(capaId) || capaId <= 0) {
    return [];
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load CAPA tasks.");
  }

  const { data } = await http.get<unknown>(
    `${CAPA_TASKS_BY_CAPA_PATH}/${encodeURIComponent(String(capaId))}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeCapaTaskList(data);
}

/** POST /CAPA/Task */
export async function createCapaTask(payload: CapaTaskRequestDto) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to create a CAPA task.");
  }

  const { data } = await http.post<unknown>(CAPA_TASK_PATH, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeCapaTaskDto(data);
}

/** PUT /CAPA/Task */
export async function updateCapaTask(payload: CapaTaskRequestDto) {
  if (!Number.isFinite(payload.id) || payload.id <= 0) {
    throw new Error("CAPA task id is required to update.");
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update a CAPA task.");
  }

  const { data } = await http.put<unknown>(CAPA_TASK_PATH, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeCapaTaskDto(data);
}

/** PATCH /CAPA/Drop/{id} — soft-drop a CAPA */
export async function dropCapa(id: number) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to drop a CAPA.");
  }

  const { data } = await http.patch<unknown>(
    `${CAPA_DROP_PATH}/${encodeURIComponent(String(id))}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
}
