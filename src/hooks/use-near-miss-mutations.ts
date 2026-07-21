import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import { createNearMiss, deleteNearMiss } from "@/services/near-miss.service";

export function useCreateNearMissMutation() {
  return useMutation({
    mutationFn: (payload: CreateNearMissRequestDto) => createNearMiss(payload),
  });
}

export function useDeleteNearMissMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNearMiss(id),
    onSuccess: () => {
      // Refetch every near-miss list page so the deleted row disappears.
      queryClient.invalidateQueries({ queryKey: ["near-miss", "list"] });
    },
  });
}
