import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SaveNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import {
  closeNearMiss,
  convertNearMissToIncident,
  createNearMiss,
  deleteNearMiss,
} from "@/services/near-miss.service";

/** Creates a near miss, or updates one when the payload carries an `id`. */
export function useCreateNearMissMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveNearMissRequestDto) => createNearMiss(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["near-miss"] });
    },
  });
}

export function useCloseNearMissMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeNearMiss(id),
    onSuccess: () => {
      // Refetch the list and the detail so the new status shows up.
      queryClient.invalidateQueries({ queryKey: ["near-miss"] });
    },
  });
}

export function useDeleteNearMissMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNearMiss(id),
    onSuccess: () => {
      // Refetch every near-miss list page so the deleted row disappears.
      queryClient.invalidateQueries({ queryKey: ["near-miss"] });
    },
  });
}

/** Links a near miss to an incident via POST /api/v1/near-misses/{id}/convert-to-incident. */
export function useConvertNearMissToIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nearMissId,
      incidentId,
    }: {
      nearMissId: string | number;
      incidentId: number;
    }) => convertNearMissToIncident(nearMissId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["near-miss"] });
    },
  });
}
