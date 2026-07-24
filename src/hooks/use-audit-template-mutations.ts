import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAuditTemplateRequestDto } from "@/dtos/req/audit-template-request.dto";
import {
  createAuditTemplate,
  publishAuditTemplate,
  updateAuditTemplate,
  type PublishAuditTemplatePayload,
} from "@/services/audit-template.service";

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

/** Publishes a draft audit template via POST /api/AuditTemplate/{id}/publish. */
export function usePublishAuditTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      templateId: string;
      payload: PublishAuditTemplatePayload;
    }) => publishAuditTemplate(vars.templateId, vars.payload),
    onSuccess: () => {
      // Refetch template lists so the published state is reflected.
      queryClient.invalidateQueries({ queryKey: ["audit-template"] });
    },
  });
}

/** Updates an existing audit template — same body shape as create. */
export function useUpdateAuditTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      templateId: string;
      payload: CreateAuditTemplateRequestDto;
      expectedUpdatedDate: string | null;
    }) =>
      updateAuditTemplate(
        vars.templateId,
        vars.payload,
        vars.expectedUpdatedDate,
      ),
    onSuccess: () => {
      // Refetch template lists so the edited template reflects its changes.
      queryClient.invalidateQueries({ queryKey: ["audit-template"] });
    },
  });
}
