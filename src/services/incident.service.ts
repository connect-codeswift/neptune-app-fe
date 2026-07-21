import type {
  CreateIncidentRequestDto,
  GetAllIncidentsRequestDto,
  TenantUserContextDto,
} from "@/dtos/req/incident-request.dto";
import type {
  GetAllIncidentsResponseDto,
  IncidentDto,
} from "@/dtos/res/incident-response.dto";
import http from "@/lib/axios";

const INCIDENT_GET_ALL_PATH = "/Incident/GetAllIncidents";
const INCIDENT_CREATE_PATH = "/Incident/incident";
const INCIDENT_GET_BY_ID_PATH = "/Incident/GetIncidentById";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asIncidentArray(value: unknown): IncidentDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is IncidentDto => isRecord(item));
}

function normalizeIncidentDto(data: unknown): IncidentDto | null {
  if (isRecord(data) && typeof data.id === "number") {
    return data as IncidentDto;
  }

  if (!isRecord(data)) {
    return null;
  }

  const candidates = [
    data.dataModel,
    data.DataModel,
    data.data,
    data.result,
    data.Result,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate) && typeof candidate.id === "number") {
      return candidate as IncidentDto;
    }
  }

  return null;
}

function normalizeGetAllIncidentsResponse(
  data: unknown,
  request: GetAllIncidentsRequestDto,
): GetAllIncidentsResponseDto {
  if (Array.isArray(data)) {
    const items = asIncidentArray(data);
    return {
      items,
      totalCount: items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  if (!isRecord(data)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  // Neptune wrapper: `{ dataModel: { data: IncidentDto[], totalRecords, pageNumber, pageSize } }`
  const dataModel = isRecord(data.dataModel)
    ? data.dataModel
    : isRecord(data.DataModel)
      ? data.DataModel
      : null;
  const nestedData = isRecord(data.data) ? data.data : null;
  const page = dataModel ?? nestedData;

  const items = asIncidentArray(
    (page && (page.data ?? page.Data ?? page.items ?? page.Items)) ??
      data.items ??
      data.Items ??
      data.data ??
      data.result ??
      data.Result ??
      data.incidents ??
      data.Records,
  );

  const totalCountRaw =
    (page &&
      (page.totalRecords ??
        page.TotalRecords ??
        page.totalCount ??
        page.TotalCount ??
        page.total ??
        page.count)) ??
    data.totalCount ??
    data.TotalCount ??
    data.total ??
    data.count;
  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw =
    (page && (page.pageNumber ?? page.PageNumber)) ??
    data.pageNumber ??
    data.PageNumber;
  const pageSizeRaw =
    (page && (page.pageSize ?? page.PageSize)) ??
    data.pageSize ??
    data.PageSize;

  return {
    items,
    totalCount,
    pageNumber:
      typeof pageNumberRaw === "number" ? pageNumberRaw : request.pageNumber,
    pageSize: typeof pageSizeRaw === "number" ? pageSizeRaw : request.pageSize,
  };
}

export async function getAllIncidents(request: GetAllIncidentsRequestDto) {
  const { data } = await http.post<unknown>(INCIDENT_GET_ALL_PATH, request);
  return normalizeGetAllIncidentsResponse(data, request);
}

export async function getIncidentById(
  params: Readonly<{
    id: number;
    userId: number;
    subCompanyId: number;
  }>,
) {
  const { data } = await http.get<unknown>(INCIDENT_GET_BY_ID_PATH, {
    params: {
      id: params.id,
      userId: params.userId,
      subCompanyId: params.subCompanyId,
    },
  });

  return normalizeIncidentDto(data);
}

export async function createIncident(payload: CreateIncidentRequestDto) {
  const { data } = await http.post<unknown>(INCIDENT_CREATE_PATH, payload);
  return normalizeIncidentDto(data) ?? (isRecord(data) ? (data as IncidentDto) : {});
}

/**
 * Marks an incident Closed without deleting it.
 * Uses GetById + POST /Incident/incident with `caseDisposition: "Closed"`.
 * Does not call DropIncident (that removes the record).
 */
export async function closeIncident(
  id: number,
  context: TenantUserContextDto,
) {
  const existing = await getIncidentById({
    id,
    userId: context.userId,
    subCompanyId: context.subCompanyId,
  });

  const payload: CreateIncidentRequestDto = {
    ...(existing ?? {}),
    id,
    userId: context.userId,
    subCompanyId: context.subCompanyId,
    reportedById: existing?.reportedById ?? context.userId,
    caseDisposition: "Closed",
    isDrop: false,
  };

  return createIncident(payload);
}
