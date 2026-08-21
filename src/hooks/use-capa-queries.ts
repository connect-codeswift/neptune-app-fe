"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import {
  getCapaAttachmentsByCapaId,
  getCapaById,
  getCapaComments,
  getCapaDashboardKpis,
  getCapaDetail,
  getCapaLifecycle,
  getCapaOpenedVsClosed,
  getCapaWorkloadByOwner,
  getCapas,
  getCapasByIncidentId,
  getCapaTasksByCapaId,
  getCapaVerificationByCapaId,
} from "@/services/capa.service";
import { getRcaByCapaId } from "@/services/rca.service";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import {
  EMPTY_LINKED_CAPA_VIEW,
  mapCapaApiToDetailRecord,
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
    scope: string;
    status: string;
    capaType: string;
    priority: string;
  }) => [...capaQueryKeys.all, "list", params] as const,
  byIncident: (incidentId: number) =>
    [...capaQueryKeys.all, "incident", incidentId] as const,
  tasks: (capaId: number) => [...capaQueryKeys.all, "tasks", capaId] as const,
  comments: (params: { capaId: number; userId: number; assignedId: number }) =>
    [...capaQueryKeys.all, "comments", params] as const,
  attachments: (capaId: number) =>
    [...capaQueryKeys.all, "attachments", capaId] as const,
  verification: (capaId: number) =>
    [...capaQueryKeys.all, "verification", capaId] as const,
  rca: (capaId: number) => [...capaQueryKeys.all, "rca", capaId] as const,
  byId: (capaId: number) => [...capaQueryKeys.all, "by-id", capaId] as const,
  review: (capaId: number) => [...capaQueryKeys.all, "review", capaId] as const,
};

/** Backend paging is 1-based; pageSize 0 returns an empty page. */
export const DEFAULT_CAPAS_PAGE_NUMBER = 1;
export const DEFAULT_CAPAS_PAGE_SIZE = 10;

/** GET /api/v1/capas/dashboard-kpis */
export function useCapaDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.dashboardKpis,
    queryFn: () => getCapaDashboardKpis(),
    enabled,
    select: (response) =>
      mapCapaDashboardKpisToMetrics(response.dataModel ?? null),
  });
}

/** GET /api/v1/capas/lifecycle */
export function useCapaLifecycleQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.lifecycle,
    queryFn: () => getCapaLifecycle(),
    enabled,
    select: (response) => mapCapaLifecycleToView(response.dataModel ?? null),
  });
}

/** GET /api/v1/capas/opened-vs-closed */
export function useCapaOpenedVsClosedQuery(enabled = true) {
  return useQuery({
    queryKey: capaQueryKeys.openedVsClosed,
    queryFn: () => getCapaOpenedVsClosed(),
    enabled,
    select: (response) => mapCapaOpenedClosedToView(response.dataModel ?? null),
  });
}

/** GET /api/v1/capas/workload-by-owner */
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
  scope?: string;
  status?: string;
  capaType?: string;
  priority?: string;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads CAPAs via GET /api/v1/capas
 * query: PageNumber=1, PageSize=10, Search="", Scope="", Status="",
 * CapaType="", Priority="" — empty = All = omit
 */
export function useCapasListQuery(options: UseCapasListQueryOptions = {}) {
  const pageNumber = options.pageNumber ?? DEFAULT_CAPAS_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_CAPAS_PAGE_SIZE;
  const enabled = options.enabled ?? false;
  const search = options.search?.trim() ?? "";
  const scope = options.scope?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const capaType = options.capaType?.trim() ?? "";
  const priority = options.priority?.trim() ?? "";

  const auth = enabled ? getAuthContext() : null;

  return useQuery({
    queryKey: capaQueryKeys.list({
      pageNumber,
      pageSize,
      search,
      scope,
      status,
      capaType,
      priority,
    }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getCapas({
        pageNumber,
        pageSize,
        search,
        scope,
        status,
        capaType,
        priority,
      });
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
 * Loads CAPAs for an incident via GET /api/v1/incidents/{incidentId}/capas.
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

/** Loads action tasks for a CAPA via GET /api/v1/capas/{capaId}/tasks. */
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

export type UseCapaCommentsQueryOptions = Readonly<{
  capaId: number | null;
  userId?: number;
  assignedId?: number;
  enabled?: boolean;
}>;

/** Loads CAPA comments via GET /api/v1/capas/{capaId}/comments. */
export function useCapaCommentsQuery(options: UseCapaCommentsQueryOptions) {
  const capaId = options.capaId;
  const userId =
    typeof options.userId === "number" &&
    Number.isFinite(options.userId) &&
    options.userId > 0
      ? Math.trunc(options.userId)
      : 0;
  const assignedId =
    typeof options.assignedId === "number" &&
    Number.isFinite(options.assignedId) &&
    options.assignedId > 0
      ? Math.trunc(options.assignedId)
      : 0;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.comments({
      capaId: capaId ?? 0,
      userId,
      assignedId,
    }),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return [];
      }

      return getCapaComments({
        capaId,
        ...(userId > 0 ? { userId } : {}),
        ...(assignedId > 0 ? { assignedId } : {}),
      });
    },
  });
}

export type UseCapaAttachmentsQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/** Loads CAPA attachments via GET /api/v1/capas/{capaId}/attachments. */
export function useCapaAttachmentsQuery(
  options: UseCapaAttachmentsQueryOptions,
) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.attachments(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return [];
      }

      return getCapaAttachmentsByCapaId(capaId);
    },
  });
}

export type UseCapaVerificationQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/** Loads CAPA verification via GET /api/v1/capas/{capaId}/verification. */
export function useCapaVerificationQuery(
  options: UseCapaVerificationQueryOptions,
) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.verification(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return null;
      }

      return getCapaVerificationByCapaId(capaId);
    },
  });
}

export type UseCapaRcaQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/**
 * Loads RCA worksheet data via GET /api/v1/capas/{capaId}/rca.
 *
 * Was a two-step lookup: read the CAPA, take its `rcaId`, fetch by that id. `Capa.RcaId` is only
 * populated for a CAPA raised from an incident, so every other CAPA — audit findings, inspections,
 * hazards, and one raised on its own — dead-ended on a null and the screen said no RCA was linked.
 * The backend now parents a contributing factor by CAPA as well as by incident, so the CAPA id is
 * enough on its own.
 */
export function useCapaRcaQuery(options: UseCapaRcaQueryOptions) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;

  return useQuery({
    queryKey: capaQueryKeys.rca(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return [];
      }

      return getRcaByCapaId(capaId);
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

export type UseCapaDetailQueryOptions = Readonly<{
  capaId: number | null;
  enabled?: boolean;
}>;

/**
 * Loads GET /api/v1/capas/{id}/detail for the detail page — the by-id row plus
 * the lifecycle stepper the backend owns.
 */
export function useCapaDetailQuery(options: UseCapaDetailQueryOptions) {
  const capaId = options.capaId;
  const enabled = (options.enabled ?? false) && capaId != null && capaId > 0;
  const auth = enabled ? getAuthContext() : null;

  return useQuery({
    queryKey: capaQueryKeys.byId(capaId ?? 0),
    enabled,
    queryFn: async () => {
      if (capaId == null || capaId <= 0) {
        return null;
      }

      return getCapaDetail(capaId);
    },
    select: (detail) => {
      if (!detail) {
        return null;
      }

      return mapCapaApiToDetailRecord(detail.capa, {
        currentUserId: auth?.userId,
        lifecycleStages: detail.lifecycleStages,
      });
    },
  });
}
