import type { GetAllIncidentsRequestDto } from "@/dtos/req/incident-request.dto";
import type {
  GetAllIncidentsResponseDto,
  IncidentDto,
} from "@/dtos/res/incident-response.dto";
import http from "@/lib/axios";

const INCIDENT_GET_ALL_PATH = "/Incident/GetAllIncidents";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asIncidentArray(value: unknown): IncidentDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is IncidentDto => isRecord(item));
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

  // Support common .NET / Neptune wrappers around IncidentDto[]
  const nestedData = isRecord(data.data) ? data.data : null;
  const items = asIncidentArray(
    data.items ??
      data.Items ??
      data.data ??
      nestedData?.items ??
      nestedData?.Items ??
      data.result ??
      data.Result ??
      data.incidents ??
      data.Records,
  );

  const totalCountRaw =
    data.totalCount ?? data.TotalCount ?? data.total ?? data.count;
  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw = data.pageNumber ?? data.PageNumber;
  const pageSizeRaw = data.pageSize ?? data.PageSize;

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
