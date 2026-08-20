import { useQuery } from "@tanstack/react-query";
import {
  getAllAuditTemplates,
  getItemsBySectionId,
  getSectionsByTemplateId,
} from "@/services/audit-template.service";
import type {
  AuditTemplateDto,
  AuditTemplateItemDto,
  AuditTemplateSectionDto,
} from "@/dtos/res/audit-template-response.dto";

export function useAuditTemplatesQuery(
  params: Readonly<{
    pageNumber: number;
    pageSize: number;
    kind?: string;
    status?: string;
  }>,
) {
  return useQuery({
    queryKey: ["audit-template", "list", params] as const,
    queryFn: () => getAllAuditTemplates(params),
  });
}

/** Everything the edit wizard needs, fetched in one dependent query. */
export type AuditTemplateDetail = Readonly<{
  summary: AuditTemplateDto | null;
  sections: AuditTemplateSectionDto[];
  itemsBySection: Record<string, AuditTemplateItemDto[]>;
}>;

/**
 * Loads a template's sections and each section's items.
 *
 * The `summary` (basic info) is passed in — the list already fetched it and
 * stashed it in the store on Edit — so this doesn't refetch the whole list.
 */
export function useAuditTemplateDetailQuery(
  templateId: string,
  summary: AuditTemplateDto | null,
) {
  return useQuery({
    queryKey: ["audit-template", "detail", templateId] as const,
    enabled: templateId !== "",
    queryFn: async (): Promise<AuditTemplateDetail> => {
      const sectionsRes = await getSectionsByTemplateId(templateId);
      const sections = sectionsRes.dataModel ?? [];
      const itemResults = await Promise.all(
        sections.map((section) => getItemsBySectionId(String(section.id))),
      );
      const itemsBySection: Record<string, AuditTemplateItemDto[]> = {};
      sections.forEach((section, index) => {
        itemsBySection[String(section.id)] = itemResults[index].dataModel ?? [];
      });
      return { summary, sections, itemsBySection };
    },
  });
}
