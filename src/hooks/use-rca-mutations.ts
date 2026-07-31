"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRcaCategory } from "@/services/rca.service";
import { rcaQueryKeys } from "@/hooks/use-rca-queries";

export function useCreateRcaCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createRcaCategory({ name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: rcaQueryKeys.categories,
      });
    },
  });
}
