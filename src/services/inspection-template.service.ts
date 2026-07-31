import type {
  CreateInspectionTemplateRequestDto,
  UpdateInspectionTemplateRequestDto,
} from "@/dtos/req/inspection-template-request.dto";
import type {
  CreateInspectionTemplateResponseDto,
  GetAllInspectionTemplatesResponseDto,
  GetInspectionTemplateItemsResponseDto,
  GetInspectionTemplateLogicsResponseDto,
  GetInspectionTemplateSectionsResponseDto,
} from "@/dtos/res/inspection-template-response.dto";
import http from "@/lib/axios";

const INSPECTION_TEMPLATE_PATH = "/InspectionTemplate";
const INSPECTION_TEMPLATE_GET_ALL_PATH = "/InspectionTemplate/GetAll";
/** Fetching one template by id is served by the AuditTemplate controller. */

export async function createInspectionTemplate(
  payload: CreateInspectionTemplateRequestDto,
) {
  const { data } = await http.post<CreateInspectionTemplateResponseDto>(
    INSPECTION_TEMPLATE_PATH,
    payload,
  );
  return data;
}

export async function updateInspectionTemplate(
  templateId: string,
  payload: UpdateInspectionTemplateRequestDto,
) {
  const { data } = await http.put<CreateInspectionTemplateResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/${encodeURIComponent(templateId)}`,
    payload,
  );
  console.log("Update inspection template response", data);

  return data;
}

export type PublishInspectionTemplatePayload = Readonly<{
  userId: number;
  subCompanyId: number;
}>;

export async function publishInspectionTemplate(
  templateId: string,
  payload: PublishInspectionTemplatePayload,
) {
  const { data } = await http.post<CreateInspectionTemplateResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/${encodeURIComponent(templateId)}/publish`,
    payload,
  );

  return data;
}

export async function getInspectionTemplateById(templateId: string) {
  const { data } = await http.get<CreateInspectionTemplateResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/${encodeURIComponent(templateId)}`,
  );

  return data;
}

export async function getSectionsByTemplateId(templateId: string) {
  const { data } = await http.get<GetInspectionTemplateSectionsResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/${encodeURIComponent(templateId)}/sections`,
  );

  return data;
}

export async function getItemsBySectionId(sectionId: string) {
  const { data } = await http.get<GetInspectionTemplateItemsResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/sections/${encodeURIComponent(sectionId)}/items`,
  );

  return data;
}

export async function getConditionalLogicsByTemplateId(templateId: string) {
  const { data } = await http.get<GetInspectionTemplateLogicsResponseDto>(
    `${INSPECTION_TEMPLATE_PATH}/${encodeURIComponent(templateId)}/conditional-logics`,
  );

  return data;
}

export async function getAllInspectionTemplates(
  params: Readonly<{
    pageNumber: number;
    pageSize: number;
    kind?: string;
    status?: string;
  }>,
) {
  const { data } = await http.get<GetAllInspectionTemplatesResponseDto>(
    INSPECTION_TEMPLATE_GET_ALL_PATH,
    // The endpoint serves both kinds of template, so scope it to inspections.
    { params: { ...params, kind: params.kind ?? "Inspection" } },
  );
  return data;
}
