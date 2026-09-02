import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAuditRequestDto,
  ReopenAuditRequestDto,
  SaveAuditResponsesRequestDto,
  SubmitAuditRequestDto,
} from "@/dtos/req/audit-request.dto";
import {
  addAuditAttachment,
  createAudit,
  deleteAuditAttachment,
  reopenAudit,
  saveAuditResponses,
  submitAudit,
} from "@/services/audit.service";
import { uploadFile } from "@/lib/upload-file";

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

/**
 * Submits a run via POST /api/v1/audits/{id}/submit.
 *
 * Deliberately does not invalidate on error: a rejected submit changes nothing
 * server-side, and refetching would discard the local answers the auditor is
 * mid-way through fixing.
 */
export function useSubmitAuditMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { auditId: string; payload: SubmitAuditRequestDto }) =>
      submitAudit(vars.auditId, vars.payload),
    onSuccess: () => {
      // The run is now locked and its findings exist, so every audit view is stale.
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

/** Reopens a submitted run via POST /api/v1/audits/{id}/reopen. */
export function useReopenAuditMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { auditId: string; payload: ReopenAuditRequestDto }) =>
      reopenAudit(vars.auditId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

/**
 * Uploads evidence and links it to the run.
 *
 * Two steps behind one mutation: the bytes go straight from the browser to the
 * private bucket via `uploadFile`, then the returned handle is linked. The API
 * never sees the file — it used to, and wrote it to a disk that was wiped on
 * every deploy.
 */
export function useAddAuditAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      auditId: string;
      file: File;
      templateItemId: number | null;
    }) => {
      const uploaded = await uploadFile(vars.file, { module: "Audit" });

      return addAuditAttachment(vars.auditId, {
        fileId: uploaded.fileId,
        templateItemId: vars.templateItemId,
      });
    },
    onSuccess: () => {
      // The detail carries `attachments`, and submit checks them for requirePhoto.
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

/** Unlinks evidence via DELETE /api/v1/audits/{id}/attachments/{attachmentId}. */
export function useDeleteAuditAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { auditId: string; attachmentId: number }) =>
      deleteAuditAttachment(vars.auditId, vars.attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
