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

const COMPLIANCE_DASHBOARD_KPIS_PATH = "/Compliance/dashboard-kpis";
const COMPLIANCE_CATEGORY_STATS_PATH = "/Compliance/category-stats";
const COMPLIANCE_GET_ALL_PATH = "/Compliance/GetAllCompliances";
const COMPLIANCE_UPCOMING_FILINGS_PATH = "/Compliance/upcoming-filings";
const COMPLIANCE_CALENDAR_PATH = "/Compliance/calendar";
const COMPLIANCE_ADD_PATH = "/Compliance/AddCompliance";
const COMPLIANCE_BY_ID_PATH = "/Compliance";
const COMPLIANCE_UPDATE_PATH = "/Compliance/Update";

/** GET /api/Compliance/dashboard-kpis */
export async function getComplianceDashboardKpis(): Promise<GetComplianceDashboardKpisResponseDto> {
  const { data } = await http.get<GetComplianceDashboardKpisResponseDto>(
    COMPLIANCE_DASHBOARD_KPIS_PATH,
  );

  return {
    ...data,
    dataModel: normalizeComplianceDashboardKpisDto(readEnvelopeDataModel(data)),
  };
}

/** GET /api/Compliance/category-stats */
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

/** POST /api/Compliance/GetAllCompliances */
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

/** GET /api/Compliance/upcoming-filings */
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

/** GET /api/Compliance/calendar?startDate=&endDate= */
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

/** POST /api/Compliance/AddCompliance */
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

/** GET /api/Compliance/{id} */
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

/** PUT /api/Compliance/Update — mark obligation complete. */
export async function markComplianceComplete(
  id: number,
): Promise<UpdateComplianceResponseDto> {
  const { data } = await http.put<UpdateComplianceResponseDto>(
    COMPLIANCE_UPDATE_PATH,
    {
      id,
      markComplete: true,
    },
  );

  return data;
}

/** DELETE /api/Compliance/{id} */
export async function deleteCompliance(
  id: number,
): Promise<DeleteComplianceResponseDto> {
  const { data } = await http.delete<DeleteComplianceResponseDto>(
    `${COMPLIANCE_BY_ID_PATH}/${String(id)}`,
  );

  return data;
}
