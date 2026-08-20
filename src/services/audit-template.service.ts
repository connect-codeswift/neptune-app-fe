import type {
  CreateAuditTemplateRequestDto,
  UpdateAuditTemplateRequestDto,
} from "@/dtos/req/audit-template-request.dto";
import type {
  CreateAuditTemplateResponseDto,
  GetAllAuditTemplatesResponseDto,
  GetTemplateItemsResponseDto,
  GetTemplateSectionsResponseDto,
} from "@/dtos/res/audit-template-response.dto";
import http from "@/lib/axios";

const AUDIT_TEMPLATE_PATH = "/audit-templates";

export async function createAuditTemplate(
  payload: CreateAuditTemplateRequestDto,
) {
  const { data } = await http.post<CreateAuditTemplateResponseDto>(
    AUDIT_TEMPLATE_PATH,
    payload,
  );

  return data;
}

export async function updateAuditTemplate(
  templateId: string,
  payload: CreateAuditTemplateRequestDto,
  expectedUpdatedDate: string | null,
) {
  // The PUT endpoint expects the flat template body plus a root-level
  // `expectedUpdatedDate` (ISO date-time or null) for its concurrency check.
  const body: UpdateAuditTemplateRequestDto = {
    ...payload,
    expectedUpdatedDate,
  };
  const { data } = await http.put<CreateAuditTemplateResponseDto>(
    `${AUDIT_TEMPLATE_PATH}/${encodeURIComponent(templateId)}`,
    body,
  );

  return data;
}

export async function getAllAuditTemplates(
  params: Readonly<{
    pageNumber: number;
    pageSize: number;
    kind?: string;
    status?: string;
  }>,
) {
  const { data } = await http.get<GetAllAuditTemplatesResponseDto>(
    AUDIT_TEMPLATE_PATH,
    // The endpoint serves both kinds of template, so scope it to audits.
    { params: { ...params, kind: params.kind ?? "Audit" } },
  );
  return data;
}

export async function getSectionsByTemplateId(templateId: string) {
  const { data } = await http.get<GetTemplateSectionsResponseDto>(
    `${AUDIT_TEMPLATE_PATH}/${encodeURIComponent(templateId)}/sections`,
  );

  return data;
}

export async function getItemsBySectionId(sectionId: string) {
  const { data } = await http.get<GetTemplateItemsResponseDto>(
    `${AUDIT_TEMPLATE_PATH}/sections/${encodeURIComponent(sectionId)}/items`,
  );

  return data;
}
