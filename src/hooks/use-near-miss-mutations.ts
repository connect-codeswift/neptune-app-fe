import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import {
  closeNearMiss,
  createNearMiss,
  deleteNearMiss,
} from "@/services/near-miss.service";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";
export function useCreateNearMissMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNearMissRequestDto) => createNearMiss(payload),
    onSuccess: () => {
      toast.success("Near-miss report submitted");
      router.push(NEAR_MISS_LIST_ROUTE);
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
