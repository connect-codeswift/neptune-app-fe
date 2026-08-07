"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import { getAuthContext } from "@/lib/auth-context";
import {
  createCapa,
  createCapaTask,
  dropCapa,
  getCapaTasksByCapaId,
  updateCapa,
  updateCapaTask,
} from "@/services/capa.service";
import {
  buildCreateCapaRequest,
  buildCreateCapaTaskRequest,
  buildUpdateCapaRequest,
  buildUpdateCapaTaskRequest,
} from "@/services/mappers/capa.mapper";
import { capaQueryKeys } from "@/hooks/use-capa-queries";

export type CreateCapaInput = Readonly<{
  incidentId: number;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
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

async function syncCapaActionTask(input: Readonly<{
  capaId: number;
  task: string;
  owner: string;
  dueDate: string;
}>) {
  const trimmedTask = input.task.trim();
  if (!trimmedTask) {
    return null;
  }

  const existingTasks = await getCapaTasksByCapaId(input.capaId);
  const existingTask = existingTasks[0];

  if (existingTask) {
    return updateCapaTask(
      buildUpdateCapaTaskRequest({
        id: existingTask.id,
        capaId: existingTask.capaId,
        userId: existingTask.userId,
        task: trimmedTask,
        owner: input.owner,
        dueDate: input.dueDate,
      }),
    );
  }

  return createCapaTask(
    buildCreateCapaTaskRequest({
      capaId: input.capaId,
      task: trimmedTask,
      owner: input.owner,
      dueDate: input.dueDate,
    }),
  );
}

export function useCreateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA.");
      }

      const payload = buildCreateCapaRequest(input);
      const capa = await createCapa(payload);

      if (capa?.id) {
        await syncCapaActionTask({
          capaId: capa.id,
          task: input.description,
          owner: input.owner,
          dueDate: input.dueDate,
        });
      }

      return capa;
    },
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
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
      const capa = await updateCapa(payload);

      await syncCapaActionTask({
        capaId: input.capa.numericId,
        task: input.description,
        owner: input.owner,
        dueDate: input.dueDate,
      });

      return capa;
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

export function useDropCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: number; incidentId: number }) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to drop a CAPA.");
      }

      return dropCapa(input.id);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
    },
  });
}
