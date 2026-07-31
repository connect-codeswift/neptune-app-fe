"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChemicalRequestDto } from "@/dtos/req/hazcom-request.dto";
import { hazcomQueryKeys } from "@/hooks/use-hazcom-queries";
import { createChemical } from "@/services/hazcom.service";

/**
 * POST /api/hazcom/chemical
 *
 * The endpoint doubles as the update route: omit `id` to create, send it to
 * overwrite the existing record (see `ChemicalRequestDto`).
 */
export function useCreateChemicalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChemicalRequestDto) => createChemical(payload),
    onSuccess: () => {
      // Drops every cached HazCom page — the new row has to appear in the
      // inventory list and in the drafts/published split.
      queryClient.invalidateQueries({ queryKey: hazcomQueryKeys.all });
    },
  });
}
