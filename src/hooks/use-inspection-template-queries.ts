import { useQuery } from "@tanstack/react-query";
import {
  getAllInspectionTemplates,
  getInspectionTemplateById,
} from "@/services/inspection-template.service";

/** Fetches a single inspection template by id. */
export function useInspectionTemplateQuery(templateId: string) {
  return useQuery({
    queryKey: ["inspection-template", "detail", templateId] as const,
    enabled: templateId !== "",
    queryFn: () => getInspectionTemplateById(templateId),
  });
}

/** Fetches a paged list of inspection templates from GET /api/InspectionTemplate/GetAll. */
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
