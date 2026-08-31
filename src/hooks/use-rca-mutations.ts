"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rcaQueryKeys } from "@/hooks/use-rca-queries";
import { capaQueryKeys } from "@/hooks/use-capa-queries";
import {
  createCapaContributingFactor,
  createContributingFactor,
  createRcaCategory,
  createRcaCorrectiveAction,
  createRcaWhys,
  dropRcaCorrectiveAction,
  dropRcaWhy,
  updateContributingFactor,
  updateRcaCorrectiveAction,
  updateRcaWhy,
} from "@/services/rca.service";
import {
  buildCreateContributingFactorRequest,
  buildCreateRcaCategoryRequest,
  buildCreateRcaCorrectiveActionRequest,
  buildCreateRcaWhysRequest,
  buildDropRcaCorrectiveActionRequest,
  buildDropRcaWhyRequest,
  buildUpdateContributingFactorRequest,
  buildUpdateRcaCorrectiveActionRequest,
  buildUpdateRcaWhyRequest,
  mapRcaCategoryDtoToView,
  mapRcaContributingFactorDtoToView,
  mapRcaCorrectiveActionDtoToViewModel,
  mapRcaWhyDtoToViewModel,
  mapRcaWhyDtosToView,
  type BuildCreateContributingFactorInput,
  type BuildCreateRcaCorrectiveActionInput,
  type BuildCreateRcaWhysInput,
  type BuildUpdateContributingFactorInput,
  type BuildUpdateRcaCorrectiveActionInput,
  type BuildUpdateRcaWhyInput,
  type RcaCategoryViewModel,
  type RcaContributingFactorViewModel,
  type RcaCorrectiveActionViewModel,
  type RcaWhyViewModel,
} from "@/services/mappers/rca.mapper";

export type DropContributingFactorInput = Readonly<{
  contributingFactorId: number;
  incidentId: number;
}>;

export type DropRcaWhyInput = Readonly<{
  whyId: number;
  incidentId: number;
}>;

export type DropRcaCorrectiveActionInput = Readonly<{
  correctiveActionId: number;
  incidentId: number;
}>;

export function useCreateRcaCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<RcaCategoryViewModel> => {
      const dto = await createRcaCategory(buildCreateRcaCategoryRequest(name));
      return mapRcaCategoryDtoToView(dto);
    },
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: rcaQueryKeys.categories,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

export function useCreateContributingFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildCreateContributingFactorInput,
    ): Promise<RcaContributingFactorViewModel> => {
      const payload = buildCreateContributingFactorRequest(input);
      const dto = await createContributingFactor(payload);
      return mapRcaContributingFactorDtoToView(dto);
    },
    onSuccess: async (_result, input) => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: rcaQueryKeys.byIncident(input.incidentId ?? 0),
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

export function useCreateCapaContributingFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      capaId: number;
      rcaCategoryId: number;
      description: string;
    }): Promise<RcaContributingFactorViewModel> => {
      const payload = buildCreateContributingFactorRequest({
        capaId: input.capaId,
        rcaCategoryId: input.rcaCategoryId,
        description: input.description,
      });
      const dto = await createCapaContributingFactor(input.capaId, payload);
      return mapRcaContributingFactorDtoToView(dto);
    },
    onSuccess: async (_result, input) => {
      try {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.rca(input.capaId),
        });
      } catch {
        // Intentionally ignored — write is done; a stale cache is not worth
        // re-reporting an already-saved record as a failed submit.
      }
    },
  });
}

export function useUpdateContributingFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildUpdateContributingFactorInput,
    ): Promise<RcaContributingFactorViewModel> => {
      const payload = buildUpdateContributingFactorRequest(input);
      const dto = await updateContributingFactor(payload);
      return mapRcaContributingFactorDtoToView(dto);
    },
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.byIncident(input.incidentId ?? 0),
      });
    },
  });
}

export function useCreateRcaWhysMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildCreateRcaWhysInput,
    ): Promise<RcaWhyViewModel[]> => {
      const payload = buildCreateRcaWhysRequest(input);
      const dtos = await createRcaWhys(payload);
      return mapRcaWhyDtosToView(dtos);
    },
    onSuccess: async (_result, input) => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: rcaQueryKeys.byIncident(input.incidentId),
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

export function useUpdateRcaWhyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildUpdateRcaWhyInput,
    ): Promise<RcaWhyViewModel> => {
      const payload = buildUpdateRcaWhyRequest(input);
      const dto = await updateRcaWhy(payload);
      return mapRcaWhyDtoToViewModel(dto);
    },
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.byIncident(input.incidentId ?? 0),
      });
    },
  });
}

export function useDropRcaWhyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DropRcaWhyInput): Promise<void> => {
      const payload = buildDropRcaWhyRequest();
      await dropRcaWhy(input.whyId, payload);
    },
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.byIncident(input.incidentId),
      });
    },
  });
}

export function useCreateRcaCorrectiveActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildCreateRcaCorrectiveActionInput,
    ): Promise<RcaCorrectiveActionViewModel> => {
      const payload = buildCreateRcaCorrectiveActionRequest(input);
      const dto = await createRcaCorrectiveAction(payload);
      return mapRcaCorrectiveActionDtoToViewModel(dto);
    },
    onSuccess: async (_result, input) => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: rcaQueryKeys.byIncident(input.incidentId),
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

export function useUpdateRcaCorrectiveActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: BuildUpdateRcaCorrectiveActionInput,
    ): Promise<RcaCorrectiveActionViewModel> => {
      const payload = buildUpdateRcaCorrectiveActionRequest(input);
      const dto = await updateRcaCorrectiveAction(payload);
      return mapRcaCorrectiveActionDtoToViewModel(dto);
    },
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.byIncident(input.incidentId ?? 0),
      });
    },
  });
}

export function useDropRcaCorrectiveActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DropRcaCorrectiveActionInput): Promise<void> => {
      const payload = buildDropRcaCorrectiveActionRequest();
      await dropRcaCorrectiveAction(input.correctiveActionId, payload);
    },
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.byIncident(input.incidentId),
      });
    },
  });
}
