import { useQuery } from "@tanstack/react-query";
import type { GetAllHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import {
  getAllHazard,
  getHazardById,
  getHazardKpiCount,
  getHazardHeatMap,
  getMonthlyHazardUsers,
  getTopHazardUsers,
} from "@/services/hazard.service";

export function useHazardListQuery(payload: GetAllHazardRequestDto) {
  return useQuery({
    queryKey: ["hazard", "list", payload] as const,
    queryFn: () => getAllHazard(payload),
  });
}

export function useHazardKpiQuery(
  params: Readonly<{ userId: number }>,
  enabled = true,
) {
  return useQuery({
    queryKey: ["hazard", "kpi", params.userId] as const,
    queryFn: () => getHazardKpiCount(params),
    enabled: enabled && params.userId > 0,
  });
}

export function useTopHazardUsersQuery() {
  return useQuery({
    queryKey: ["hazard", "top-users"] as const,
    queryFn: () => getTopHazardUsers(),
  });
}

export function useMonthlyHazardUsersQuery(
  params: Readonly<{ year: number; month: number }>,
) {
  return useQuery({
    queryKey: ["hazard", "monthly-users", params] as const,
    queryFn: () => getMonthlyHazardUsers(params),
    enabled: params.year > 0 && params.month >= 1 && params.month <= 12,
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
  params: Readonly<{ siteId: number; userId: number }>,
) {
  return useQuery({
    queryKey: ["hazard", "detail", id, params] as const,
    queryFn: () => getHazardById(id, params),
    enabled: id !== "",
  });
}
