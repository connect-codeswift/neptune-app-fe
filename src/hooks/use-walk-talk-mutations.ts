import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWalkTalkRequestDto } from "@/dtos/req/walk-talk-request.dto";
import { createWalkTalk } from "@/services/walk-talk.service";

export function useCreateWalkTalkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWalkTalkRequestDto) => createWalkTalk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walkandtalk"] });
    },
  });
}
