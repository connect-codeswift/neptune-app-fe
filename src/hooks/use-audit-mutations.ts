import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAuditRequestDto,
  SubmitAuditRequestDto,
} from "@/dtos/req/audit-request.dto";
import { createAudit, submitAudit } from "@/services/audit.service";

/** Submits a completed audit via POST /api/Audit/{id}/submit. */
export function useSubmitAuditMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { auditId: string; payload: SubmitAuditRequestDto }) =>
      submitAudit(vars.auditId, vars.payload),
    onSuccess: () => {
      // Refetch audit lists/details so the submitted state is reflected.
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

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
