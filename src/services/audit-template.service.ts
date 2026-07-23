import type { CreateAuditTemplateRequestDto } from "@/dtos/req/audit-template-request.dto";
import type { CreateAuditTemplateResponseDto } from "@/dtos/res/audit-template-response.dto";
import http from "@/lib/axios";

const AUDIT_TEMPLATE_PATH = "/AuditTemplate";

export async function createAuditTemplate(
  payload: CreateAuditTemplateRequestDto,
) {
  const { data } = await http.post<CreateAuditTemplateResponseDto>(
    AUDIT_TEMPLATE_PATH,
    payload,
  );
  console.log("Create audit template response", data);

  return data;
}
