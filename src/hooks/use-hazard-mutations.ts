import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SaveHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import {
  closeHazard,
  createHazard,
  dropHazard,
} from "@/services/hazard.service";

/** Creates a hazard, or updates one when the payload carries an `id`. */
export function useCreateHazardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveHazardRequestDto) => createHazard(payload),
    onSuccess: () => {
      // Refetch lists and details so the saved values show up.
      queryClient.invalidateQueries({ queryKey: ["hazard"] });
    },
  });
}

export function useDropHazardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      siteId,
      userId,
    }: {
      id: string;
      siteId: number;
      userId: number;
    }) => dropHazard(id, { siteId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hazard"] });
    },
  });
}

export function useCloseHazardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeHazard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hazard"] });
    },
  });
}

