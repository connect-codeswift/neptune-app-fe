import type { FormValues } from "@/components/form-builder";
import type {
  InspectionTemplateDto,
  InspectionTemplateItemDto,
} from "@/dtos/res/inspection-template-response.dto";
import type { InspectionTemplateDetail } from "@/hooks/use-inspection-template-queries";
import {
  TEMPLATE_ITEM_TYPES,
  type TemplateItem,
  type TemplateItemType,
  type TemplateSection,
  type WizardState,
} from "@/components/inspections/templates/create/template-builder-data";
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

/** Coerce an API item type string onto the known union, defaulting to Text. */
function toItemType(raw: string | undefined): TemplateItemType {
  return (TEMPLATE_ITEM_TYPES as readonly string[]).includes(raw ?? "")
    ? (raw as TemplateItemType)
    : "Text";
}

function mapItem(dto: InspectionTemplateItemDto): TemplateItem {
  const type = toItemType(dto.itemType);

  // On create the entered value was published as `question`, so restore it into
  // `value` — that's what the Build Sections control renders and displays.
  return {
    id: String(dto.id),
    type,
    label: "",
    required: dto.isRequired ?? true,
    value: dto.question ?? "",
  };
}

/**
 * Assemble a fetched template's parts into the edit wizard's state.
 *
 * `summary` is passed in rather than read off `detail`: the detail query caches
 * whatever summary it was called with, and the store hydrates after the first
 * render, so the cached copy can be a stale null.
 */
export function mapDetailToWizardState(
  detail: InspectionTemplateDetail,
  summary: InspectionTemplateDto | null,
): WizardState {
  const tags = (summary?.templateTags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  const values: FormValues = {
    templateName: summary?.templateName ?? "",
    templateType: summary?.templateType ?? "Inspection",
    tags,
    frequency: summary?.frequency ?? "",
    description: summary?.description ?? "",
  };

  // Guard the spread: an unexpected response shape would otherwise throw
  // "not iterable" here rather than degrading to an empty wizard.
  const detailSections = Array.isArray(detail.sections) ? detail.sections : [];

  const sections: TemplateSection[] = [...detailSections]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => {
      const sectionItems = detail.itemsBySection[String(section.id)];

      return {
        id: String(section.id),
        title: section.sectionTitle ?? section.title ?? "",
        description: section.description ?? "",
        items: (Array.isArray(sectionItems) ? [...sectionItems] : [])
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map(mapItem),
      };
    });

  return { values, sections };
}
