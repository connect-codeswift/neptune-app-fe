import type {
  CreateAuditRequestDto,
  SaveAuditResponsesRequestDto,
} from "@/dtos/req/audit-request.dto";
import type {
  CreateAuditResponseDto,
  GetAllAuditsResponseDto,
  GetAuditByIdResponseDto,
  GetAuditFindingsResponseDto,
  GetAuditReportResponseDto,
  SaveAuditResponsesResponseDto,
} from "@/dtos/res/audit-response.dto";
import http from "@/lib/axios";

const AUDIT_PATH = "/Audit";

export async function createAudit(payload: CreateAuditRequestDto) {
  const { data } = await http.post<CreateAuditResponseDto>(AUDIT_PATH, payload);
  return data;
}

export async function getAllAudits(
  params?: Readonly<{ pageNumber: number; pageSize: number; kind?: string }>,
) {
  const { data } = await http.get<GetAllAuditsResponseDto>(AUDIT_PATH, {
    // The endpoint serves both kinds, so scope it to audits by default.
    params: {
      PageNumber: params?.pageNumber,
      PageSize: params?.pageSize,
      kind: params?.kind ?? "Audit",
    },
  });

  return data;
}

export async function getAuditById(auditId: string) {
  const { data } = await http.get<GetAuditByIdResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}`,
  );

  return data;
}

export async function getAuditFindings(auditId: string) {
  const { data } = await http.get<GetAuditFindingsResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/findings`,
  );
  console.log("Get audit findings response", data);

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
  console.log(data);

  return data;
}

export async function getAuditReport(auditId: string) {
  const { data } = await http.get<GetAuditReportResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/report`,
  );
  console.log("Get audit report response", data);

  return data;
}
