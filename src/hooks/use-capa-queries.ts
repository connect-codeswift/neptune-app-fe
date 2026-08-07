"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import {
  getCapaAttachmentsByCapaId,
  getCapaById,
  getCapasByIncidentId,
  getCapaTasksByCapaId,
  getCapaVerificationByCapaId,
} from "@/services/capa.service";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import {
  EMPTY_LINKED_CAPA_VIEW,
  mapCapaDtosToLinkedView,
} from "@/services/mappers/capa.mapper";

export const capaQueryKeys = {
  all: ["capas"] as const,
  byIncident: (incidentId: number) =>
    [...capaQueryKeys.all, "incident", incidentId] as const,
  tasks: (capaId: number) =>
    [...capaQueryKeys.all, "tasks", capaId] as const,
  review: (capaId: number) =>
    [...capaQueryKeys.all, "review", capaId] as const,
};

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
