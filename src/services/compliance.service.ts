import type {
  AddComplianceRequestDto,
  GetAllCompliancesRequestDto,
} from "@/dtos/req/compliance-request.dto";
import type {
  AddComplianceResponseDto,
  ComplianceDto,
  GetComplianceByIdResponseDto,
  GetComplianceCalendarResponseDto,
  GetComplianceCategoryStatsResponseDto,
  GetComplianceDashboardKpisResponseDto,
  GetComplianceUpcomingFilingsResponseDto,
  UpdateComplianceResponseDto,
  DeleteComplianceResponseDto,
} from "@/dtos/res/compliance-response.dto";
import {
  normalizeComplianceCalendarEventsList,
  normalizeComplianceByIdResponse,
  normalizeComplianceCategoryStatsList,
  normalizeComplianceDashboardKpisDto,
  normalizeComplianceUpcomingFilingsList,
  normalizeGetAllCompliancesResponse,
} from "@/services/mappers/compliance.mapper";
import http from "@/lib/axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Reads `dataModel` / `DataModel` from a Neptune API envelope. */
function readEnvelopeDataModel(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  if ("dataModel" in data) {
    return data.dataModel;
  }

  if ("DataModel" in data) {
    return data.DataModel;
  }

  return data;
}

const COMPLIANCE_DASHBOARD_KPIS_PATH = "/compliance-records/dashboard-kpis";
const COMPLIANCE_CATEGORY_STATS_PATH = "/compliance-records/category-stats";
const COMPLIANCE_GET_ALL_PATH = "/compliance-records/search";
const COMPLIANCE_UPCOMING_FILINGS_PATH = "/compliance-records/upcoming-filings";
const COMPLIANCE_CALENDAR_PATH = "/compliance-records/calendar";
const COMPLIANCE_ADD_PATH = "/compliance-records";
const COMPLIANCE_BY_ID_PATH = "/compliance-records";

/** GET /api/v1/compliance-records/dashboard-kpis */
export async function getComplianceDashboardKpis(): Promise<GetComplianceDashboardKpisResponseDto> {
  const { data } = await http.get<GetComplianceDashboardKpisResponseDto>(
    COMPLIANCE_DASHBOARD_KPIS_PATH,
  );

  return {
    ...data,
    dataModel: normalizeComplianceDashboardKpisDto(readEnvelopeDataModel(data)),
  };
}

/** GET /api/v1/compliance-records/category-stats */
export async function getComplianceCategoryStats(): Promise<GetComplianceCategoryStatsResponseDto> {
  const { data } = await http.get<GetComplianceCategoryStatsResponseDto>(
    COMPLIANCE_CATEGORY_STATS_PATH,
  );

  return {
    ...data,
    dataModel: normalizeComplianceCategoryStatsList(
      readEnvelopeDataModel(data),
    ),
  };
}

/** POST /api/v1/compliance-records/search */
export async function getAllCompliances(request: GetAllCompliancesRequestDto) {
  const payload: GetAllCompliancesRequestDto = {
    pageNumber: request.pageNumber,
    pageSize: request.pageSize,
    search: request.search?.trim() ?? "",
    jurisdiction: request.jurisdiction?.trim() ?? "",
    status: request.status?.trim() ?? "",
  };

  const { data } = await http.post<unknown>(COMPLIANCE_GET_ALL_PATH, payload);
  return normalizeGetAllCompliancesResponse(data, request);
}

/** GET /api/v1/compliance-records/upcoming-filings */
export async function getComplianceUpcomingFilings(): Promise<GetComplianceUpcomingFilingsResponseDto> {
  const { data } = await http.get<GetComplianceUpcomingFilingsResponseDto>(
    COMPLIANCE_UPCOMING_FILINGS_PATH,
  );

  return {
    ...data,
    dataModel: normalizeComplianceUpcomingFilingsList(data.dataModel),
  };
}

export type GetComplianceCalendarParams = Readonly<{
  startDate: string;
  endDate: string;
}>;

/** GET /api/v1/compliance-records/calendar?startDate=&endDate= */
export async function getComplianceCalendar(
  params: GetComplianceCalendarParams,
): Promise<GetComplianceCalendarResponseDto> {
  const { data } = await http.get<GetComplianceCalendarResponseDto>(
    COMPLIANCE_CALENDAR_PATH,
    {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    },
  );

  return {
    ...data,
    dataModel: normalizeComplianceCalendarEventsList(data.dataModel),
  };
}

/** POST /api/v1/compliance-records */
export async function addCompliance(
  payload: AddComplianceRequestDto,
): Promise<AddComplianceResponseDto> {
  const { data } = await http.post<AddComplianceResponseDto>(
    COMPLIANCE_ADD_PATH,
    {
      title: payload.title.trim(),
      category: payload.category.trim(),
      code: payload.code.trim(),
      jurisdiction: payload.jurisdiction.trim(),
      regulatoryBody: payload.regulatoryBody.trim(),
      dueDate: payload.dueDate,
      recurrence: payload.recurrence.trim(),
      responsiblePersonId: payload.responsiblePersonId,
      priority: payload.priority.trim(),
      evidenceUrls: payload.evidenceUrls,
    },
  );

  return data;
}

/** GET /api/v1/compliance-records/{id} */
export async function getComplianceById(
  id: number,
): Promise<ComplianceDto | null> {
  const { data } = await http.get<GetComplianceByIdResponseDto>(
    `${COMPLIANCE_BY_ID_PATH}/${String(id)}`,
  );

  const dto = normalizeComplianceByIdResponse(data);
  if (!dto) {
    return null;
  }

  // Detail responses often omit id — use the path param so updates target the
  // existing row instead of sending 0 (which the backend treats as create).
  return {
    ...dto,
    id: dto.id ?? id,
  };
}

/**
 * PUT /api/v1/compliance-records/{id} — mark obligation complete.
 * The id moved from the request body to the path in the v1 rename; the body is
 * otherwise unchanged (the backend now ignores its `id` rather than reading it).
 */
export async function markComplianceComplete(
  id: number,
): Promise<UpdateComplianceResponseDto> {
  const { data } = await http.put<UpdateComplianceResponseDto>(
    `${COMPLIANCE_BY_ID_PATH}/${String(id)}`,
    {
      id,
      markComplete: true,
    },
  );

  return data;
}

/** DELETE /api/v1/compliance-records/{id} */
export async function deleteCompliance(
  id: number,
): Promise<DeleteComplianceResponseDto> {
  const { data } = await http.delete<DeleteComplianceResponseDto>(
    `${COMPLIANCE_BY_ID_PATH}/${String(id)}`,
  );

  return data;
}
