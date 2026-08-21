import type { FormValues } from "@/components/form-builder";
import type {
  AuditTemplateDto,
  AuditTemplateItemDto,
} from "@/dtos/res/audit-template-response.dto";
import type { AuditTemplateDetail } from "@/hooks/use-audit-template-queries";
import {
  TEMPLATE_ITEM_TYPES,
  type TemplateItem,
  type TemplateItemType,
  type TemplateSection,
  type WizardState,
} from "@/components/audits/templates/create/template-builder-data";
import type { AuditTemplate } from "@/app/dashboard/audits/template/audit-templates-data";
import type { AuditChecklist } from "@/app/dashboard/audits/checklist/audit-checklist-data";

/** Turn an API audit template into the card's display shape. */
export function mapAuditTemplateDtoToCard(
  dto: AuditTemplateDto,
): AuditTemplate {
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
    scope: dto.templateType || "Audit",
    lastUsed: lastUsed || "—",
  };
}

/** Coerce an API item type string onto the known union, defaulting to Text. */
function toItemType(raw: string | undefined): TemplateItemType {
  return (TEMPLATE_ITEM_TYPES as readonly string[]).includes(raw ?? "")
    ? (raw as TemplateItemType)
    : "Text";
}

function mapItem(dto: AuditTemplateItemDto): TemplateItem {
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

/** Assemble a fetched template's sections and items into a runnable checklist. */
export function mapDetailToChecklist(
  detail: AuditTemplateDetail,
  templateId: string,
): AuditChecklist {
  const sections = [...detail.sections]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => ({
      id: String(section.id),
      title: section.sectionTitle ?? section.title ?? "Untitled section",
      items: [...(detail.itemsBySection[String(section.id)] ?? [])]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((item) => ({
          id: String(item.id),
          question: item.question ?? "",
        })),
    }));

  return {
    auditId: `TPL-${templateId}`,
    subtitle: detail.summary?.templateName ?? "Audit checklist",
    sections,
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
  detail: AuditTemplateDetail,
  summary: AuditTemplateDto | null,
): WizardState {
  const tags = (summary?.templateTags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  const values: FormValues = {
    templateName: summary?.templateName ?? "",
    templateType: summary?.templateType ?? "Audit",
    tags,
    frequency: summary?.frequency ?? "",
    description: summary?.description ?? "",
  };

  const sections: TemplateSection[] = detail.sections.map((section) => ({
    id: String(section.id),
    title: section.sectionTitle ?? section.title ?? "",
    description: section.description ?? "",
    items: (detail.itemsBySection[String(section.id)] ?? []).map(mapItem),
  }));

  return { values, sections };
}
