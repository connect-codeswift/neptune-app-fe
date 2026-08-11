"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import { getAuthContext } from "@/lib/auth-context";
import {
  createCapa,
  createCapaTask,
  deleteCapaTask,
  submitCapaVerification,
  updateCapa,
} from "@/services/capa.service";
import {
  buildCreateCapaTaskRequest,
  buildCapaVerificationRequest,
  buildUpdateCapaRequest,
  buildVerifiedCapaUpdateRequest,
} from "@/services/mappers/capa.mapper";
import { capaQueryKeys } from "@/hooks/use-capa-queries";

export type CreateCapaTaskDraftInput = Readonly<{
  task: string;
  owner: string;
  dueDate: string;
  priority?: string;
}>;

/** POST /api/CAPA/Capa body + optional checklist tasks created afterward. */
export type CreateCapaInput = Readonly<{
  payload: CreateCapaRequestDto;
  tasks?: readonly CreateCapaTaskDraftInput[];
}>;

export type UpdateCapaInput = Readonly<{
  capa: CapaItem;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}>;

export type CreateCapaTaskInput = Readonly<{
  capaId: number;
  /** Used for cache invalidation; optional for standalone CAPA detail. */
  incidentId?: number;
  task: string;
  owner: string;
  dueDate: string;
  priority?: string;
}>;

export type DeleteCapaTaskInput = Readonly<{
  taskId: number;
  capaId: number;
  incidentId: number;
}>;

export function useCreateCapaTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaTaskInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA task.");
      }

      return createCapaTask(
        buildCreateCapaTaskRequest({
          capaId: input.capaId,
          task: input.task,
          owner: input.owner,
          dueDate: input.dueDate,
          priority: input.priority,
        }),
      );
    },
    onSuccess: async (_result, variables) => {
      if (variables.incidentId && variables.incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(variables.incidentId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useDeleteCapaTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteCapaTaskInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to delete a CAPA task.");
      }

      return deleteCapaTask(input.taskId);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useCreateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA.");
      }

      const capa = await createCapa(input.payload);

      if (capa?.id) {
        for (const task of input.tasks ?? []) {
          const trimmedTask = task.task.trim();
          if (!trimmedTask) {
            continue;
          }

          await createCapaTask(
            buildCreateCapaTaskRequest({
              capaId: capa.id,
              task: trimmedTask,
              owner: task.owner,
              dueDate: task.dueDate,
              priority: task.priority,
            }),
          );
        }
      }

      return capa;
    },
    onSuccess: async (result, variables) => {
      const incidentId = variables.payload.incidentId ?? 0;
      if (incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(incidentId),
        });
      }
      if (result?.id) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.tasks(result.id),
        });
      }
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useUpdateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to update a CAPA.");
      }

      const payload = buildUpdateCapaRequest(input);
      return updateCapa(payload);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.capa.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export type VerifyCapaInput = Readonly<{
  capa: CapaItem;
  incidentId: number;
  effectiveness: CapaEffectiveness;
  notes?: string;
}>;

export function useVerifyCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VerifyCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to verify a CAPA.");
      }

      await submitCapaVerification(
        buildCapaVerificationRequest({
          capaId: input.capa.numericId,
          effectiveness: input.effectiveness,
          notes: input.notes,
        }),
      );

      return updateCapa(buildVerifiedCapaUpdateRequest(input.capa));
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}
