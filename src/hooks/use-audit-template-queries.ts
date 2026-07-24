import { useQuery } from "@tanstack/react-query";
import {
  getAllAuditTemplates,
  getConditionalLogicsByTemplateId,
  getItemsBySectionId,
  getSectionsByTemplateId,
} from "@/services/audit-template.service";
import type {
  AuditTemplateDto,
  AuditTemplateItemDto,
  AuditTemplateLogicDto,
  AuditTemplateSectionDto,
} from "@/dtos/res/audit-template-response.dto";

export function useAuditTemplatesQuery(
  params: Readonly<{ pageNumber: number; pageSize: number }>,
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
  logics: AuditTemplateLogicDto[];
}>;

/**
 * Loads a template's sections, each section's items, and conditional logics.
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
      const [sectionsRes, logicsRes] = await Promise.all([
        getSectionsByTemplateId(templateId),
        getConditionalLogicsByTemplateId(templateId),
      ]);

      const sections = sectionsRes.dataModel ?? [];
      const logics = logicsRes.dataModel ?? [];
      const itemResults = await Promise.all(
        sections.map((section) => getItemsBySectionId(String(section.id))),
      );
      const itemsBySection: Record<string, AuditTemplateItemDto[]> = {};
      sections.forEach((section, index) => {
        itemsBySection[String(section.id)] = itemResults[index].dataModel ?? [];
      });
      return { summary, sections, itemsBySection, logics };
    },
  });
}
