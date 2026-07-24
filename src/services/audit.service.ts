import type { CreateAuditRequestDto } from "@/dtos/req/audit-request.dto";
import type {
  CreateAuditResponseDto,
  GetAllAuditsResponseDto,
  GetAuditByIdResponseDto,
} from "@/dtos/res/audit-response.dto";
import http from "@/lib/axios";

const AUDIT_PATH = "/Audit";

export async function createAudit(payload: CreateAuditRequestDto) {
  const { data } = await http.post<CreateAuditResponseDto>(AUDIT_PATH, payload);

  return data;
}

export async function getAllAudits(
  params: Readonly<{ pageNumber: number; pageSize: number }>,
) {
  const { data } = await http.get<GetAllAuditsResponseDto>(AUDIT_PATH, {
    params: { PageNumber: params.pageNumber, PageSize: params.pageSize },
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
