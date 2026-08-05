import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateBbsObservationRequestDto,
  UpdateBbsObservationRequestDto,
} from "@/dtos/req/bbs-request.dto";
import {
  createBbsObservation,
  updateBbsObservation,
} from "@/services/bbs.service";

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

export function useUpdateBbsObservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBbsObservationRequestDto) =>
      updateBbsObservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bbs"] });
    },
  });
}
