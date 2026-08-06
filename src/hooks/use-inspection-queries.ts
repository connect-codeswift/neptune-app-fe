import { useQuery } from "@tanstack/react-query";
import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import {
  getAllInspections,
  getInspectionById,
  getInspectionDetailSummary,
  getInspectionFindings,
  getInspectionSummary,
} from "@/services/inspection.service";

export const inspectionQueryKeys = {
  all: ["inspection"] as const,
  summary: (userId: number | null) =>
    [...inspectionQueryKeys.all, "summary", userId] as const,
  list: (params: RegisterListParams | undefined) =>
    [...inspectionQueryKeys.all, "list", params] as const,
  detail: (inspectionId: string | null) =>
    [...inspectionQueryKeys.all, "detail", inspectionId] as const,
  detailSummary: (inspectionId: string | null) =>
    [...inspectionQueryKeys.all, "detail-summary", inspectionId] as const,
  findings: (inspectionId: string | null) =>
    [...inspectionQueryKeys.all, "findings", inspectionId] as const,
};

/** Fetches a paged list of inspections from GET /api/Inspection. */
export function useInspectionsQuery(params: RegisterListParams) {
  return useQuery({
    queryKey: inspectionQueryKeys.list(params),
    queryFn: () => getAllInspections(params),
    placeholderData: (previous) => previous,
  });
}

/** KPI tiles from GET /api/Inspection/summary — scoped per signed-in user. */
export function useInspectionSummaryQuery(
  userId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: inspectionQueryKeys.summary(userId),
    queryFn: () => getInspectionSummary(),
    enabled: enabled && userId !== null && userId > 0,
  });
}

/** Fetches a single inspection's detail from GET /api/Inspection/{id}. */
export function useInspectionDetailQuery(inspectionId: string | null) {
  return useQuery({
    queryKey: inspectionQueryKeys.detail(inspectionId),
    enabled: inspectionId !== null && inspectionId !== "",
    queryFn: () => getInspectionById(inspectionId ?? ""),
  });
}

/** Donut + top findings from GET /api/Inspection/{id}/detail-summary. */
export function useInspectionDetailSummaryQuery(inspectionId: string | null) {
  return useQuery({
    queryKey: inspectionQueryKeys.detailSummary(inspectionId),
    enabled: inspectionId !== null,
    retry: (failureCount, error) => {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined;
      if (status === 403 || status === 404 || status === 400) return false;
      return failureCount < 2;
    },
    queryFn: () => getInspectionDetailSummary(inspectionId ?? ""),
  });
}

/** Fetches an inspection's findings from GET /api/Inspection/{id}/findings. */
export function useInspectionFindingsQuery(inspectionId: string | null) {
  return useQuery({
    queryKey: inspectionQueryKeys.findings(inspectionId),
    enabled: inspectionId !== null && inspectionId !== "",
    retry: (failureCount, error) => {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
    queryFn: () => getInspectionFindings(inspectionId ?? ""),
  });
}
