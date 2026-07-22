import { useQuery } from "@tanstack/react-query";
import type { GetAllHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import {
  getAllHazard,
  getHazardById,
  getHazardKpi,
  getTopHazardUsers,
} from "@/services/hazard.service";

export function useHazardListQuery(payload: GetAllHazardRequestDto) {
  return useQuery({
    queryKey: ["hazard", "list", payload] as const,
    queryFn: () => getAllHazard(payload),
  });
}

export function useHazardKpiQuery() {
  return useQuery({
    queryKey: ["hazard", "kpi"] as const,
    queryFn: () => getHazardKpi(),
  });
}

export function useTopHazardUsersQuery() {
  return useQuery({
    queryKey: ["hazard", "top-users"] as const,
    queryFn: () => getTopHazardUsers(),
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
