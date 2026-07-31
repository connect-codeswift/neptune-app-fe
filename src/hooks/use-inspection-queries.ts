import { useQuery } from "@tanstack/react-query";
import {
  getAllInspections,
  getInspectionById,
} from "@/services/inspection.service";

/** Fetches a paged list of inspections from GET /api/Inspection. */
export function useInspectionsQuery(
  params?: Readonly<{ pageNumber: number; pageSize: number; kind?: string }>,
) {
  return useQuery({
    queryKey: ["inspection", "list", params] as const,
    queryFn: () => getAllInspections(params),
  });
}

/** Fetches a single inspection's detail from GET /api/Inspection/{id}. */
export function useInspectionDetailQuery(inspectionId: string | null) {
  return useQuery({
    queryKey: ["inspection", "detail", inspectionId] as const,
    enabled: inspectionId !== null && inspectionId !== "",
    queryFn: () => getInspectionById(inspectionId ?? ""),
  });
}
