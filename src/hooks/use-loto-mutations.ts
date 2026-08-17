"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApplyLotoLockoutRequestDto,
  RemoveLotoLockoutRequestDto,
  UpsertLotoEquipmentRequestDto,
} from "@/dtos/req/loto-request.dto";
import { lotoQueryKeys } from "@/hooks/use-loto-queries";
import {
  applyLotoLockout,
  createLotoEquipment,
  removeLotoLockout,
  updateLotoEquipment,
} from "@/services/loto.service";

function useInvalidateLoto() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: lotoQueryKeys.all });
}

/** POST /api/Loto/equipment — creates the machine and its procedure in one call. */
export function useCreateLotoEquipmentMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (payload: UpsertLotoEquipmentRequestDto) =>
      createLotoEquipment(payload),
    onSuccess: () => {
      void invalidate();
    },
  });
}

/** PUT /api/Loto/equipment/{id} — same body as create; the code cannot change. */
export function useUpdateLotoEquipmentMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (variables: {
      id: number;
      payload: UpsertLotoEquipmentRequestDto;
    }) => updateLotoEquipment(variables.id, variables.payload),
    onSuccess: () => {
      void invalidate();
    },
  });
}

/** POST /api/Loto/lockouts — the backend assigns the lock number. */
export function useApplyLotoLockoutMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (payload: ApplyLotoLockoutRequestDto) =>
      applyLotoLockout(payload),
    onSuccess: () => {
      void invalidate();
    },
  });
}

/** POST /api/Loto/lockouts/{id}/remove — both confirmation flags are required. */
export function useRemoveLotoLockoutMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (variables: {
      id: number;
      payload: RemoveLotoLockoutRequestDto;
    }) => removeLotoLockout(variables.id, variables.payload),
    onSuccess: () => {
      void invalidate();
    },
  });
}
