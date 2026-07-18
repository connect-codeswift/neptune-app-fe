import { useMutation } from "@tanstack/react-query";
import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import { createNearMiss } from "@/services/near-miss.service";

export function useCreateNearMissMutation() {
  return useMutation({
    mutationFn: (payload: CreateNearMissRequestDto) => createNearMiss(payload),
  });
}
