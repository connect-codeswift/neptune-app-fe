"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  GetAllLotoEquipmentRequestDto,
  GetAllLotoLockoutsRequestDto,
  LotoEquipmentStatusFilterDto,
  LotoLockoutStatusFilterDto,
} from "@/dtos/req/loto-request.dto";
import {
  getAllLotoEquipment,
  getAllLotoLockouts,
  getLotoActiveLockouts,
  getLotoDashboardKpis,
  getLotoEquipmentById,
  getLotoEquipmentHistory,
  getLotoLocations,
  getLotoPersonnel,
} from "@/services/loto.service";
import {
  toLotoActiveLockout,
  toLotoEquipmentItem,
  toLotoHistoryRecord,
  toLotoPersonnel,
} from "@/services/mappers/loto.mapper";

export const lotoQueryKeys = {
  all: ["loto"] as const,
  dashboardKpis: () => [...lotoQueryKeys.all, "dashboard-kpis"] as const,
  equipment: (params: GetAllLotoEquipmentRequestDto) =>
    [...lotoQueryKeys.all, "equipment", params] as const,
  equipmentDetail: (id: number) =>
    [...lotoQueryKeys.all, "equipment-detail", id] as const,
  equipmentHistory: (id: number) =>
    [...lotoQueryKeys.all, "equipment-history", id] as const,
  locations: (search: string) =>
    [...lotoQueryKeys.all, "locations", search] as const,
  activeLockouts: () => [...lotoQueryKeys.all, "active-lockouts"] as const,
  lockouts: (params: GetAllLotoLockoutsRequestDto) =>
    [...lotoQueryKeys.all, "lockouts", params] as const,
  personnel: () => [...lotoQueryKeys.all, "personnel"] as const,
};

export const DEFAULT_LOTO_PAGE_NUMBER = 1;
export const DEFAULT_LOTO_PAGE_SIZE = 10;

/** GET /api/Loto/dashboard-kpis — the equipment tab's KPI strip and tab counts. */
export function useLotoDashboardKpisQuery(enabled: boolean) {
  return useQuery({
    queryKey: lotoQueryKeys.dashboardKpis(),
    queryFn: () => getLotoDashboardKpis(),
    enabled,
  });
}

export type LotoEquipmentListParams = Readonly<{
  pageNumber: number;
  pageSize: number;
  search: string;
  status: LotoEquipmentStatusFilterDto;
}>;

/** POST /api/Loto/GetAllEquipment — paginated, server-side search + status filter. */
export function useLotoEquipmentQuery(
  params: LotoEquipmentListParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: lotoQueryKeys.equipment(params),
    queryFn: () => getAllLotoEquipment(params),
    enabled,
    placeholderData: keepPreviousData,
    select: (page) => ({
      ...page,
      items: page.items.map(toLotoEquipmentItem),
    }),
  });
}

/** GET /api/Loto/equipment/{id} — raw detail DTO; callers compose the view they need. */
export function useLotoEquipmentDetailQuery(id: number | null, enabled = true) {
  return useQuery({
    queryKey: lotoQueryKeys.equipmentDetail(id ?? -1),
    queryFn: () => getLotoEquipmentById(id ?? 0),
    enabled: enabled && id !== null && id > 0,
  });
}

/** GET /api/Loto/equipment/{id}/history — one machine's lockouts, newest first. */
export function useLotoEquipmentHistoryQuery(
  id: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: lotoQueryKeys.equipmentHistory(id ?? -1),
    queryFn: () => getLotoEquipmentHistory(id ?? 0),
    enabled: enabled && id !== null && id > 0,
  });
}

/**
 * GET /api/Loto/locations?search= — the create/edit form's location picker.
 * Each distinct term is its own cache entry; debounce before it gets here.
 */
export function useLotoLocationsQuery(search: string, enabled: boolean) {
  return useQuery({
    queryKey: lotoQueryKeys.locations(search),
    queryFn: () => getLotoLocations(search),
    enabled,
  });
}

/** GET /api/Loto/active-lockouts — mapped to the active-lockout card rows. */
export function useLotoActiveLockoutsQuery(enabled: boolean) {
  return useQuery({
    queryKey: lotoQueryKeys.activeLockouts(),
    queryFn: () => getLotoActiveLockouts(),
    enabled,
    select: (rows) => rows.map(toLotoActiveLockout),
  });
}

export type LotoLockoutHistoryParams = Readonly<{
  pageNumber: number;
  pageSize: number;
  search: string;
  status: LotoLockoutStatusFilterDto;
}>;

/** POST /api/Loto/GetAllLockouts — the global site-wide history log. */
export function useLotoLockoutHistoryQuery(
  params: LotoLockoutHistoryParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: lotoQueryKeys.lockouts(params),
    queryFn: () => getAllLotoLockouts(params),
    enabled,
    placeholderData: keepPreviousData,
    select: (page) => ({
      ...page,
      items: page.items.map(toLotoHistoryRecord),
    }),
  });
}

/** GET /api/Loto/personnel — everyone authorized on at least one machine on this site. */
export function useLotoPersonnelQuery(enabled: boolean) {
  return useQuery({
    queryKey: lotoQueryKeys.personnel(),
    queryFn: () => getLotoPersonnel(),
    enabled,
    select: (rows) => rows.map(toLotoPersonnel),
  });
}
