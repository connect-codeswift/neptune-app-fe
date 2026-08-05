import type {
  CreateAuditTemplateRequestDto,
  UpdateAuditTemplateRequestDto,
} from "@/dtos/req/audit-template-request.dto";
import type {
  CreateAuditTemplateResponseDto,
  GetAllAuditTemplatesResponseDto,
  GetTemplateItemsResponseDto,
  GetTemplateLogicsResponseDto,
  GetTemplateSectionsResponseDto,
} from "@/dtos/res/audit-template-response.dto";
import http from "@/lib/axios";

const AUDIT_TEMPLATE_PATH = "/AuditTemplate";
const AUDIT_TEMPLATE_GET_ALL_PATH = "/AuditTemplate/GetAll";
const SECTIONS_BY_TEMPLATE_PATH = "/AuditTemplate/GetSectionsByTemplateId";
const ITEMS_BY_SECTION_PATH = "/AuditTemplate/GetItemsBySectionId";
const LOGICS_BY_TEMPLATE_PATH =
  "/AuditTemplate/GetConditionalLogicsByTemplateId";

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

export type PublishAuditTemplatePayload = Readonly<{
  userId: number;
  siteId: number;
}>;

export async function publishAuditTemplate(
  templateId: string,
  payload: PublishAuditTemplatePayload,
) {
  const { data } = await http.post<CreateAuditTemplateResponseDto>(
    `${AUDIT_TEMPLATE_PATH}/${encodeURIComponent(templateId)}/publish`,
    payload,
  );
  console.log("Publish audit template response", data);

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
    AUDIT_TEMPLATE_GET_ALL_PATH,
    // The endpoint serves both kinds of template, so scope it to audits.
    { params: { ...params, kind: params.kind ?? "Audit" } },
  );
  return data;
}

export async function getSectionsByTemplateId(templateId: string) {
  const { data } = await http.get<GetTemplateSectionsResponseDto>(
    `${SECTIONS_BY_TEMPLATE_PATH}/${encodeURIComponent(templateId)}`,
  );

  return data;
}

export async function getItemsBySectionId(sectionId: string) {
  const { data } = await http.get<GetTemplateItemsResponseDto>(
    `${ITEMS_BY_SECTION_PATH}/${encodeURIComponent(sectionId)}`,
  );

  return data;
}

export async function getConditionalLogicsByTemplateId(templateId: string) {
  const { data } = await http.get<GetTemplateLogicsResponseDto>(
    `${LOGICS_BY_TEMPLATE_PATH}/${encodeURIComponent(templateId)}`,
  );

  return data;
}
