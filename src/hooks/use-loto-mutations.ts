"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApplyLotoLockoutRequestDto,
  RemoveLotoLockoutRequestDto,
  SaveLotoCertificationRequestDto,
  UpsertLotoEquipmentRequestDto,
} from "@/dtos/req/loto-request.dto";
import { lotoQueryKeys } from "@/hooks/use-loto-queries";
import {
  applyLotoLockout,
  createLotoEquipment,
  dropLotoEquipment,
  removeLotoLockout,
  saveLotoCertification,
  updateLotoEquipment,
} from "@/services/loto.service";

function useInvalidateLoto() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: lotoQueryKeys.all });
}

/** POST /api/v1/loto/equipment — creates the machine and its procedure in one call. */
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

/** PUT /api/v1/loto/equipment/{id} — same body as create; the code cannot change. */
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

/** DELETE /api/v1/loto/equipment/{id} — refused while a lockout is still on the machine. */
export function useDropLotoEquipmentMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (id: number) => dropLotoEquipment(id),
    onSuccess: () => {
      void invalidate();
    },
  });
}

/** POST /api/v1/loto/lockouts — the backend assigns the lock number. */
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

/** POST /api/v1/loto/lockouts/{id}/remove — both confirmation flags are required. */
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

/**
 * PUT /api/v1/loto/personnel/certification — needs `Loto.Update`.
 *
 * Invalidates the whole LOTO cache rather than just the personnel list: the certification also
 * decides whether the caller is blocked from applying a lockout, so the equipment detail would
 * otherwise keep showing a stale block reason.
 */
export function useSaveLotoCertificationMutation() {
  const invalidate = useInvalidateLoto();

  return useMutation({
    mutationFn: (payload: SaveLotoCertificationRequestDto) =>
      saveLotoCertification(payload),
    onSuccess: () => {
      void invalidate();
    },
  });
}
