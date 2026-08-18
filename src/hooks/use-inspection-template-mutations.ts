import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateInspectionTemplateRequestDto,
  UpdateInspectionTemplateRequestDto,
} from "@/dtos/req/inspection-template-request.dto";
import {
  createInspectionTemplate,
  publishInspectionTemplate,
  type PublishInspectionTemplatePayload,
  updateInspectionTemplate,
} from "@/services/inspection-template.service";

/** Updates an existing inspection template via PUT /api/v1/inspection-templates/{id}. */
export function useUpdateInspectionTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      templateId: string;
      payload: UpdateInspectionTemplateRequestDto;
    }) => updateInspectionTemplate(vars.templateId, vars.payload),
    onSuccess: () => {
      // Refetch template lists so the edited template reflects its changes.
      queryClient.invalidateQueries({ queryKey: ["inspection-template"] });
    },
  });
}

/** Creates an inspection template — published or draft, per the payload's flags. */
export function useCreateInspectionTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInspectionTemplateRequestDto) =>
      createInspectionTemplate(payload),
    onSuccess: () => {
      // Refetch template lists so the new template shows up.
      queryClient.invalidateQueries({ queryKey: ["inspection-template"] });
    },
  });
}

/**
 * Publishes an already-saved inspection template via
 * POST /api/v1/inspection-templates/{id}/publish.
 */
export function usePublishInspectionTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      templateId: string;
      payload: PublishInspectionTemplatePayload;
    }) => publishInspectionTemplate(vars.templateId, vars.payload),
    onSuccess: () => {
      // Refetch template lists so the published template reflects its state.
      queryClient.invalidateQueries({ queryKey: ["inspection-template"] });
    },
  });
}
