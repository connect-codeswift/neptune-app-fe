import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBbsObservationRequestDto } from "@/dtos/req/bbs-request.dto";
import { createBbsObservation } from "@/services/bbs.service";

export function useCreateBbsObservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBbsObservationRequestDto) =>
      createBbsObservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bbs"] });
    },
  });
}
