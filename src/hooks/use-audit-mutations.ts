import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAuditRequestDto } from "@/dtos/req/audit-request.dto";
import { createAudit } from "@/services/audit.service";

/** Starts (schedules) an audit from a template via POST /api/Audit. */
export function useCreateAuditMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAuditRequestDto) => createAudit(payload),
    onSuccess: () => {
      // Refetch audit lists so the new audit appears in the register.
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
