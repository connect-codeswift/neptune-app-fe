import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import type {
  GetAuditDetailSummaryResponseDto,
  GetAuditSummaryResponseDto,
} from "@/dtos/res/audit-inspection-dashboard.dto";
import type {
  CreateAuditResponseDto,
  GetAllAuditsResponseDto,
  GetAuditByIdResponseDto,
  GetAuditFindingsResponseDto,
  GetAuditReportResponseDto,
  SaveAuditResponsesResponseDto,
} from "@/dtos/res/audit-response.dto";
import type {
  CreateAuditRequestDto,
  SaveAuditResponsesRequestDto,
} from "@/dtos/req/audit-request.dto";
import http from "@/lib/axios";
import {
  normalizeDetailSummaryDto,
  normalizeSummaryDto,
} from "@/lib/map-audit-inspection-dashboard";

const AUDIT_PATH = "/audits";

function buildRegisterQueryParams(params: RegisterListParams) {
  return {
    kind: "Audit",
    PageNumber: params.pageNumber,
    PageSize: params.pageSize,
    Status: params.status || undefined,
    AssigneeId: params.assigneeId,
    From: params.from,
    To: params.to,
    Search: params.search || undefined,
  };
}

export async function createAudit(payload: CreateAuditRequestDto) {
  const { data } = await http.post<CreateAuditResponseDto>(AUDIT_PATH, payload);
  return data;
}

export async function getAllAudits(params: RegisterListParams) {
  const { data } = await http.get<GetAllAuditsResponseDto>(AUDIT_PATH, {
    params: buildRegisterQueryParams(params),
  });

  return data;
}

export async function getAuditSummary() {
  const { data } = await http.get<GetAuditSummaryResponseDto>(
    `${AUDIT_PATH}/summary`,
    { params: { kind: "Audit" } },
  );

  return {
    ...data,
    dataModel: normalizeSummaryDto(data.dataModel),
  };
}

export async function getAuditById(auditId: string) {
  const { data } = await http.get<GetAuditByIdResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}`,
  );

  return data;
}

export async function getAuditDetailSummary(auditId: string) {
  const { data } = await http.get<GetAuditDetailSummaryResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/detail-summary`,
  );

  return {
    ...data,
    dataModel: normalizeDetailSummaryDto(data.dataModel),
  };
}

export async function getAuditFindings(auditId: string) {
  const { data } = await http.get<GetAuditFindingsResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/findings`,
  );

  return data;
}

export async function saveAuditResponses(
  auditId: string,
  payload: SaveAuditResponsesRequestDto,
) {
  const { data } = await http.put<SaveAuditResponsesResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/responses`,
    payload,
  );

  return data;
}

export async function getAuditReport(auditId: string) {
  const { data } = await http.get<GetAuditReportResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/report`,
  );

  return data;
}
