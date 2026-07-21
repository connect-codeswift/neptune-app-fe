"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import { createCapa, dropCapa } from "@/services/capa.service";
import { buildCreateCapaRequest } from "@/services/mappers/capa.mapper";
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

export function useCreateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA.");
      }

      const payload = buildCreateCapaRequest(input);
      return createCapa(payload);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
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
