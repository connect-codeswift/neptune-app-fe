import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateInspectionRequestDto,
  ReopenInspectionRequestDto,
  SaveInspectionResponsesRequestDto,
  SubmitInspectionRequestDto,
} from "@/dtos/req/inspection-request.dto";
import {
  addInspectionAttachment,
  createInspection,
  deleteInspectionAttachment,
  reopenInspection,
  saveInspectionResponses,
  submitInspection,
} from "@/services/inspection.service";
import { uploadFile } from "@/lib/upload-file";

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

/**
 * Submits a run via POST /api/v1/inspections/{id}/submit.
 *
 * Deliberately does not invalidate on error: a rejected submit changes nothing
 * server-side, and refetching would discard the local answers the inspector is
 * mid-way through fixing.
 */
export function useSubmitInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      inspectionId: string;
      payload: SubmitInspectionRequestDto;
    }) => submitInspection(vars.inspectionId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}

/** Reopens a submitted run via POST /api/v1/inspections/{id}/reopen. */
export function useReopenInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      inspectionId: string;
      payload: ReopenInspectionRequestDto;
    }) => reopenInspection(vars.inspectionId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}

/**
 * Uploads evidence and links it to the run. The bytes go straight from the
 * browser to the private bucket; the API only ever sees the handle.
 */
export function useAddInspectionAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      inspectionId: string;
      file: File;
      inspectionItemId: number | null;
    }) => {
      const uploaded = await uploadFile(vars.file, { module: "Inspection" });

      return addInspectionAttachment(vars.inspectionId, {
        fileId: uploaded.fileId,
        inspectionItemId: vars.inspectionItemId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}

/** Unlinks evidence via DELETE /api/v1/inspections/{id}/attachments/{attachmentId}. */
export function useDeleteInspectionAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { inspectionId: string; attachmentId: number }) =>
      deleteInspectionAttachment(vars.inspectionId, vars.attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection"] });
    },
  });
}
