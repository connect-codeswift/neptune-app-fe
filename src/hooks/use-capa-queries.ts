"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import {
  getCapaAttachmentsByCapaId,
  getCapaById,
  getCapaDashboardKpis,
  getCapaLifecycle,
  getCapaOpenedVsClosed,
  getCapaWorkloadByOwner,
  getCapas,
  getCapasByIncidentId,
  getCapaTasksByCapaId,
  getCapaVerificationByCapaId,
} from "@/services/capa.service";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import {
  EMPTY_LINKED_CAPA_VIEW,
  mapCapaDtosToDashboardItems,
  mapCapaDtosToLinkedView,
} from "@/services/mappers/capa.mapper";
import { mapCapaDashboardKpisToMetrics } from "@/services/mappers/capa-dashboard-kpis.mapper";
import { mapCapaLifecycleToView } from "@/services/mappers/capa-lifecycle.mapper";
import { mapCapaOpenedClosedToView } from "@/services/mappers/capa-opened-closed.mapper";
import { mapCapaWorkloadByOwnerToView } from "@/services/mappers/capa-workload-by-owner.mapper";

export const capaQueryKeys = {
  all: ["capas"] as const,
  dashboardKpis: ["capas", "dashboard-kpis"] as const,
  lifecycle: ["capas", "lifecycle"] as const,
  openedVsClosed: ["capas", "opened-vs-closed"] as const,
  workloadByOwner: ["capas", "workload-by-owner"] as const,
  list: (params: {
    pageNumber: number;
    pageSize: number;
    search: string;
    status: string;
    capaType: string;
    priority: string;
    assignedId: number;
  }) => [...capaQueryKeys.all, "list", params] as const,
  byIncident: (incidentId: number) =>
    [...capaQueryKeys.all, "incident", incidentId] as const,
  tasks: (capaId: number) => [...capaQueryKeys.all, "tasks", capaId] as const,
  review: (capaId: number) => [...capaQueryKeys.all, "review", capaId] as const,
};

/** Backend paging is 1-based; pageSize 0 returns an empty page. */
export const DEFAULT_CAPAS_PAGE_NUMBER = 1;
export const DEFAULT_CAPAS_PAGE_SIZE = 10;

/** GET /api/CAPA/dashboard-kpis */
export function useCapaDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.dashboardKpis,
    queryFn: () => getCapaDashboardKpis(),
    enabled,
    select: (response) =>
      mapCapaDashboardKpisToMetrics(response.dataModel ?? null),
  });
}

/** GET /api/CAPA/lifecycle */
export function useCapaLifecycleQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.lifecycle,
    queryFn: () => getCapaLifecycle(),
    enabled,
    select: (response) => mapCapaLifecycleToView(response.dataModel ?? null),
  });
}

/** GET /api/CAPA/opened-vs-closed */
export function useCapaOpenedVsClosedQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.openedVsClosed,
    queryFn: () => getCapaOpenedVsClosed(),
    enabled,
    select: (response) => mapCapaOpenedClosedToView(response.dataModel ?? null),
  });
}

/** GET /api/CAPA/workload-by-owner */
export function useCapaWorkloadByOwnerQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.workloadByOwner,
    queryFn: () => getCapaWorkloadByOwner(),
    enabled,
    select: (response) =>
      mapCapaWorkloadByOwnerToView(response.dataModel ?? null),
  });
}

export type UseCapasListQueryOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  capaType?: string;
  priority?: string;
  assignedId?: number;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads CAPAs via GET /api/CAPA
 * query: PageNumber=1, PageSize=10, Search="", Status="", CapaType="",
 * Priority="", AssignedId omitted when unset
 */
export function useCapasListQuery(options: UseCapasListQueryOptions = {}) {
  const pageNumber = options.pageNumber ?? DEFAULT_CAPAS_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_CAPAS_PAGE_SIZE;
  const enabled = options.enabled ?? false;
  const search = options.search?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const capaType = options.capaType?.trim() ?? "";
  const priority = options.priority?.trim() ?? "";
  const assignedId =
    typeof options.assignedId === "number" &&
    Number.isFinite(options.assignedId) &&
    options.assignedId > 0
      ? Math.trunc(options.assignedId)
      : 0;

  const auth = enabled ? getAuthContext() : null;

  return useQuery({
    queryKey: capaQueryKeys.list({
      pageNumber,
      pageSize,
      search,
      status,
      capaType,
      priority,
      assignedId,
    }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getCapas({
        pageNumber,
        pageSize,
        search,
        status,
        capaType,
        priority,
        ...(assignedId > 0 ? { assignedId } : {}),
      });
      console.log(response);
      return {
        ...response,
        items: mapCapaDtosToDashboardItems(response.items, {
          currentUserId: auth?.userId,
        }),
      };
    },
  });
}

export type UseCapasByIncidentQueryOptions = Readonly<{
  incidentId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads CAPAs for an incident via GET /api/CAPA/Incident/{incidentId}.
 */
export function useCapasByIncidentQuery(
  options: UseCapasByIncidentQueryOptions,
) {
  const incidentId = options.incidentId;
  const enabled =
    (options.enabled ?? false) && incidentId != null && incidentId > 0;

  const auth = enabled ? getAuthContext() : null;

  return useQuery({
    queryKey: capaQueryKeys.byIncident(incidentId ?? 0),
    enabled,
    queryFn: async () => {
      if (incidentId == null || incidentId <= 0) {
        return EMPTY_LINKED_CAPA_VIEW;
      }

      const dtos = await getCapasByIncidentId(incidentId);
      const activeDtos = dtos.filter((dto) => !dto.isDrop);
      const tasksByCapaId = new Map<number, CapaTaskDto[]>();

      await Promise.all(
        activeDtos.map(async (dto) => {
          try {
            const tasks = await getCapaTasksByCapaId(dto.id);
            tasksByCapaId.set(dto.id, tasks);
          } catch {
            tasksByCapaId.set(dto.id, []);
          }
        }),
      );

      return mapCapaDtosToLinkedView(dtos, {
        currentUserId: auth?.userId,
        tasksByCapaId,
      });
    },
  });
}

export type UseCapaTasksQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/** Loads action tasks for a CAPA via GET /api/CAPA/Tasks/{capaId}. */
export function useCapaTasksQuery(options: UseCapaTasksQueryOptions) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.tasks(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return [];
      }

      return getCapaTasksByCapaId(capaId);
    },
  });
}

export type UseCapaReviewQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/** Loads CAPA detail, task, attachments, and verification for manager review. */
export function useCapaReviewQuery(options: UseCapaReviewQueryOptions) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.review(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return null;
      }

      const [capa, tasks, attachments, verification] = await Promise.all([
        getCapaById(capaId),
        getCapaTasksByCapaId(capaId),
        getCapaAttachmentsByCapaId(capaId),
        getCapaVerificationByCapaId(capaId),
      ]);

      return { capa, tasks, attachments, verification };
    },
  });
}
