import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SaveHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { createHazard } from "@/services/hazard.service";

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
