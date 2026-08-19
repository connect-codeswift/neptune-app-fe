import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import type {
  CreateInspectionRequestDto,
  SaveInspectionResponsesRequestDto,
} from "@/dtos/req/inspection-request.dto";
import type {
  GetInspectionDetailSummaryResponseDto,
  GetInspectionSummaryResponseDto,
} from "@/dtos/res/audit-inspection-dashboard.dto";
import type {
  CreateInspectionResponseDto,
  GetAllInspectionsResponseDto,
  GetInspectionByIdResponseDto,
  GetInspectionFindingsResponseDto,
  SaveInspectionResponsesResponseDto,
} from "@/dtos/res/inspection-response.dto";
import http from "@/lib/axios";
import {
  normalizeDetailSummaryDto,
  normalizeSummaryDto,
} from "@/lib/map-audit-inspection-dashboard";

const INSPECTION_PATH = "/inspections";

function buildRegisterQueryParams(params: RegisterListParams) {
  return {
    PageNumber: params.pageNumber,
    PageSize: params.pageSize,
    Status: params.status || undefined,
    AssigneeId: params.assigneeId,
    From: params.from,
    To: params.to,
    Search: params.search || undefined,
  };
}

export async function createInspection(payload: CreateInspectionRequestDto) {
  const { data } = await http.post<CreateInspectionResponseDto>(
    INSPECTION_PATH,
    payload,
  );
  return data;
}

export async function getAllInspections(params: RegisterListParams) {
  const { data } = await http.get<GetAllInspectionsResponseDto>(
    INSPECTION_PATH,
    { params: buildRegisterQueryParams(params) },
  );

  return data;
}

export async function getInspectionSummary() {
  const { data } = await http.get<GetInspectionSummaryResponseDto>(
    `${INSPECTION_PATH}/summary`,
  );

  return {
    ...data,
    dataModel: normalizeSummaryDto(data.dataModel),
  };
}

export async function saveInspectionResponses(
  inspectionId: string,
  payload: SaveInspectionResponsesRequestDto,
) {
  const { data } = await http.put<SaveInspectionResponsesResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/responses`,
    payload,
  );
  return data;
}

export async function getInspectionById(inspectionId: string) {
  const { data } = await http.get<GetInspectionByIdResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}`,
  );

  return data;
}

export async function getInspectionDetailSummary(inspectionId: string) {
  const { data } = await http.get<GetInspectionDetailSummaryResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/detail-summary`,
  );

  return {
    ...data,
    dataModel: normalizeDetailSummaryDto(data.dataModel),
  };
}

export async function getInspectionFindings(inspectionId: string) {
  const { data } = await http.get<GetInspectionFindingsResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/findings`,
  );

  return data;
}
