import type { InspectionTemplateDto } from "@/dtos/res/inspection-template-response.dto";
import type { InspectionTemplate } from "@/app/dashboard/inspections/template/inspection-templates-data";

/** Turn an API inspection template into the card's display shape. */
export function mapInspectionTemplateDtoToCard(
  dto: InspectionTemplateDto,
): InspectionTemplate {
  const tags = (dto.templateTags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
  const lastUsed = (
    dto.lastUsedDate ||
    dto.updatedDate ||
    dto.createdDate ||
    ""
  ).slice(0, 10);

  return {
    id: String(dto.id),
    title: dto.templateName || "Untitled template",
    sectionCount: dto.sectionCount,
    itemCount: dto.itemCount,
    category: tags[0] ?? dto.templateType ?? "General",
    scope: dto.templateType || "Inspection",
    lastUsed: lastUsed || "—",
  };
}
