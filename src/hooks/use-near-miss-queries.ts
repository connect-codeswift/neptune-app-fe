import { useQuery } from "@tanstack/react-query";
import type { GetAllNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import {
  getAllNearMiss,
  getNearMissById,
  getNearMissKpi,
  getTopNearMissUsers,
} from "@/services/near-miss.service";

export function useNearMissListQuery(payload: GetAllNearMissRequestDto) {
  return useQuery({
    queryKey: ["near-miss", "list", payload] as const,
    queryFn: () => getAllNearMiss(payload),
  });
}

export function useNearMissKpiQuery() {
  return useQuery({
    queryKey: ["near-miss", "kpi"] as const,
    queryFn: () => getNearMissKpi(),
  });
}

export function useTopNearMissUsersQuery() {
  return useQuery({
    queryKey: ["near-miss", "top-users"] as const,
    queryFn: () => getTopNearMissUsers(),
  });
}

export function useNearMissDetailQuery(id: string) {
  return useQuery({
    queryKey: ["near-miss", "detail", id] as const,
    queryFn: () => getNearMissById(id),
    enabled: id !== "",
  });
}
