import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateInspectionTemplateRequestDto } from "@/dtos/req/inspection-template-request.dto";
import { createInspectionTemplate } from "@/services/inspection-template.service";

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
