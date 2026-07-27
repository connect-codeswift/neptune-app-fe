import type { CreateInspectionTemplateRequestDto } from "@/dtos/req/inspection-template-request.dto";
import type { CreateInspectionTemplateResponseDto } from "@/dtos/res/inspection-template-response.dto";
import http from "@/lib/axios";

const INSPECTION_TEMPLATE_PATH = "/InspectionTemplate";

export async function createInspectionTemplate(
  payload: CreateInspectionTemplateRequestDto,
) {
  const { data } = await http.post<CreateInspectionTemplateResponseDto>(
    INSPECTION_TEMPLATE_PATH,
    payload,
  );
  console.log("Create inspection template response", data);

  return data;
}
