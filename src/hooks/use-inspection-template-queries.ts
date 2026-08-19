import { useQuery } from "@tanstack/react-query";
import {
  getAllInspectionTemplates,
  getConditionalLogicsByTemplateId,
  getInspectionTemplateById,
  getItemsBySectionId,
  getSectionsByTemplateId,
} from "@/services/inspection-template.service";
import type {
  InspectionTemplateDto,
  InspectionTemplateItemDto,
  InspectionTemplateLogicDto,
  InspectionTemplateSectionDto,
} from "@/dtos/res/inspection-template-response.dto";

/**
 * Pull a list out of an envelope's `dataModel`, whatever shape it arrives in.
 *
 * These endpoints aren't consistent about wrapping — some return the array
 * directly, some nest it under `data` — and anything else would blow up the
 * mappers with "not iterable", so an unrecognised shape becomes an empty list.
 */
function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload !== null && typeof payload === "object") {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as T[];
  }

  return [];
}

/** Everything the edit wizard needs, fetched in one dependent query. */
export type InspectionTemplateDetail = Readonly<{
  summary: InspectionTemplateDto | null;
  sections: InspectionTemplateSectionDto[];
  itemsBySection: Record<string, InspectionTemplateItemDto[]>;
  logics: InspectionTemplateLogicDto[];
}>;

/**
 * Loads a template's sections, each section's items, and conditional logics.
 *
 * The `summary` (basic info) is passed in — the list already fetched it and
 * stashed it in the store on Edit — so this doesn't refetch the whole list.
 */
export function useInspectionTemplateDetailQuery(
  templateId: string,
  summary: InspectionTemplateDto | null,
) {
  return useQuery({
    queryKey: ["inspection-template", "detail", templateId] as const,
    enabled: templateId !== "",
    queryFn: async (): Promise<InspectionTemplateDetail> => {
      const [sectionsRes, logicsRes] = await Promise.all([
        getSectionsByTemplateId(templateId),
        getConditionalLogicsByTemplateId(templateId),
      ]);

      const sections = toList<InspectionTemplateSectionDto>(
        sectionsRes.dataModel,
      );
      const logics = toList<InspectionTemplateLogicDto>(logicsRes.dataModel);

      const itemResults = await Promise.all(
        sections.map((section) => getItemsBySectionId(String(section.id))),
      );
      const itemsBySection: Record<string, InspectionTemplateItemDto[]> = {};
      sections.forEach((section, index) => {
        itemsBySection[String(section.id)] = toList<InspectionTemplateItemDto>(
          itemResults[index].dataModel,
        );
      });

      return { summary, sections, itemsBySection, logics };
    },
  });
}

/**
 * Fetches a single inspection template by id.
 *
 * Keyed "by-id" rather than "detail": `useInspectionTemplateDetailQuery` caches
 * a composed InspectionTemplateDetail, and sharing one key meant whichever hook
 * resolved first handed the other its own shape. Mutations invalidate on the
 * ["inspection-template"] prefix, so both keys are still cleared together.
 */
export function useInspectionTemplateQuery(templateId: string) {
  return useQuery({
    queryKey: ["inspection-template", "by-id", templateId] as const,
    enabled: templateId !== "",
    queryFn: () => getInspectionTemplateById(templateId),
  });
}

/** Fetches a paged list of inspection templates from GET /api/v1/inspection-templates. */
export function useInspectionTemplatesQuery(
  params: Readonly<{
    pageNumber: number;
    pageSize: number;
    kind?: string;
    status?: string;
  }>,
) {
  return useQuery({
    queryKey: ["inspection-template", "list", params] as const,
    queryFn: () => getAllInspectionTemplates(params),
  });
}
