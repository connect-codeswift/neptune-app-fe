import type {
  CreateAuditRequestDto,
  SubmitAuditRequestDto,
} from "@/dtos/req/audit-request.dto";
import type {
  CreateAuditResponseDto,
  GetAllAuditsResponseDto,
  GetAuditByIdResponseDto,
  GetAuditFindingsResponseDto,
  GetAuditReportResponseDto,
  SubmitAuditResponseDto,
} from "@/dtos/res/audit-response.dto";
import http from "@/lib/axios";

const AUDIT_PATH = "/Audit";

export async function createAudit(payload: CreateAuditRequestDto) {
  const { data } = await http.post<CreateAuditResponseDto>(AUDIT_PATH, payload);
  return data;
}

export async function getAllAudits(
  params?: Readonly<{ pageNumber: number; pageSize: number }>,
) {
  const { data } = await http.get<GetAllAuditsResponseDto>(AUDIT_PATH, {
    params: { PageNumber: params?.pageNumber, PageSize: params?.pageSize },
  });

  return data;
}

export async function getAuditById(auditId: string) {
  const { data } = await http.get<GetAuditByIdResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}`,
  );
  console.log("Get audit by id response", data);

  return data;
}

export async function getAuditFindings(auditId: string) {
  const { data } = await http.get<GetAuditFindingsResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/findings`,
  );
  console.log("Get audit findings response", data);

  return data;
}

export async function submitAudit(
  auditId: string,
  payload: SubmitAuditRequestDto,
) {
  console.log("Submit audit request", auditId, payload);
  const { data } = await http.post<SubmitAuditResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/submit`,
    payload,
  );
  console.log("Submit audit response", data);

  return data;
}

export async function getAuditReport(auditId: string) {
  const { data } = await http.get<GetAuditReportResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/report`,
  );
  console.log("Get audit report response", data);

  return data;
}
