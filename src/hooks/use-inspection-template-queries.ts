import { useQuery } from "@tanstack/react-query";
import { getAllInspectionTemplates } from "@/services/inspection-template.service";

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
