import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAuditRequestDto,
  SaveAuditResponsesRequestDto,
} from "@/dtos/req/audit-request.dto";
import { createAudit, saveAuditResponses } from "@/services/audit.service";

/** Records an audit's answers via POST /api/v1/audits/{id}/responses. */
export function useSaveAuditResponsesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      auditId: string;
      payload: SaveAuditResponsesRequestDto;
    }) => saveAuditResponses(vars.auditId, vars.payload),
    onSuccess: () => {
      // Refetch audit lists/details so the new answers are reflected.
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

/** Starts (schedules) an audit from a template via POST /api/v1/audits. */
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
