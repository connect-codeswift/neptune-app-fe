import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAuditTemplateRequestDto } from "@/dtos/req/audit-template-request.dto";
import { createAuditTemplate } from "@/services/audit-template.service";

/** Creates an audit template — published or draft, per the payload's flags. */
export function useCreateAuditTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAuditTemplateRequestDto) =>
      createAuditTemplate(payload),
    onSuccess: () => {
      // Refetch template lists so the new template shows up.
      queryClient.invalidateQueries({ queryKey: ["audit-template"] });
    },
  });
}
