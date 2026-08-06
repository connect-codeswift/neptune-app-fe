import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  IssuePpeRequestDto,
  ReplacePpeRequestDto,
} from "@/dtos/req/ppe-request.dto";
import { createReplacePpeRequest, issuePpe } from "@/services/ppe.service";

export function useIssuePpeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssuePpeRequestDto) => issuePpe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppe"] });
    },
  });
}

export function useReplacePpeRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplacePpeRequestDto) =>
      createReplacePpeRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppe"] });
    },
  });
}
