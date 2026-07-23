import { useQuery } from "@tanstack/react-query";
import type { GetAllHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import {
  getAllHazard,
  getHazardById,
  getHazardKpi,
  getHazardHeatMap,
  getTopHazardUsers,
} from "@/services/hazard.service";

export function useHazardListQuery(payload: GetAllHazardRequestDto) {
  return useQuery({
    queryKey: ["hazard", "list", payload] as const,
    queryFn: () => getAllHazard(payload),
  });
}

export function useHazardKpiQuery(enabled = true) {
  return useQuery({
    queryKey: ["hazard", "kpi"] as const,
    queryFn: () => getHazardKpi(),
    enabled,
  });
}

export function useTopHazardUsersQuery() {
  return useQuery({
    queryKey: ["hazard", "top-users"] as const,
    queryFn: () => getTopHazardUsers(),
  });
}

export function useHazardHeatMapQuery() {
  return useQuery({
    queryKey: ["hazard", "heat-map"] as const,
    queryFn: () => getHazardHeatMap(),
  });
}

export function useHazardDetailQuery(
  id: string,
  params: Readonly<{ subCompanyId: number; userId: number }>,
) {
  return useQuery({
    queryKey: ["hazard", "detail", id, params] as const,
    queryFn: () => getHazardById(id, params),
    enabled: id !== "",
  });
}
