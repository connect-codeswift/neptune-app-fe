import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateInspectionRequestDto,
  SaveInspectionResponsesRequestDto,
} from "@/dtos/req/inspection-request.dto";
import {
  createInspection,
  saveInspectionResponses,
} from "@/services/inspection.service";

/** Records an inspection's answers via PUT /api/v1/inspections/{id}/responses. */
export function useSaveInspectionResponsesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      inspectionId: string;
      payload: SaveInspectionResponsesRequestDto;
    }) => saveInspectionResponses(vars.inspectionId, vars.payload),
    onSuccess: () => {
      // Refetch inspection lists/details so the new answers are reflected.
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}

/** Starts (schedules) an inspection from a template via POST /api/v1/inspections. */
export function useCreateInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInspectionRequestDto) =>
      createInspection(payload),
    onSuccess: () => {
      // Refetch inspection lists so the new inspection appears.
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}
