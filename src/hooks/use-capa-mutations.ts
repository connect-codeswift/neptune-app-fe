"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import type { CapaTaskStatus } from "@/dtos/req/capa-task-status-request.dto";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import { getAuthContext } from "@/lib/auth-context";
import {
  createCapa,
  createCapaComment,
  createCapaTask,
  deleteCapaTask,
  dropCapa,
  submitCapaVerification,
  updateCapa,
  updateCapaTask,
  updateCapaTaskStatus,
  uploadCapaAttachments,
} from "@/services/capa.service";
import {
  buildCreateCapaTaskRequest,
  buildCapaVerificationRequest,
  buildUpdateCapaRequest,
  buildUpdateCapaTaskRequest,
  buildUpdateCapaTaskStatusRequest,
  buildVerifiedCapaUpdateRequest,
  formAttachmentValuesToDtos,
} from "@/services/mappers/capa.mapper";
import { capaQueryKeys } from "@/hooks/use-capa-queries";

export type CreateCapaTaskDraftInput = Readonly<{
  task: string;
  dueDate: string;
  priority?: string;
}>;

/** POST /api/v1/capas body + optional checklist tasks created afterward. */
export type CreateCapaInput = Readonly<{
  payload: CreateCapaRequestDto;
  tasks?: readonly CreateCapaTaskDraftInput[];
}>;

export type UpdateCapaInput = Readonly<{
  capa: CapaItem;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}>;

export type CreateCapaTaskInput = Readonly<{
  capaId: number;
  /** Used for cache invalidation; optional for standalone CAPA detail. */
  incidentId?: number;
  task: string;
  dueDate: string;
  priority?: string;
}>;

export type CreateCapaCommentInput = Readonly<{
  capaId: number;
  assignedId: number;
  description: string;
  title?: string;
}>;

export type UploadCapaAttachmentsInput = Readonly<{
  capaId: number;
  /** FormBuilder `attachments` photo field value (Cloudinary URLs). */
  attachments: unknown;
}>;

export type DeleteCapaTaskInput = Readonly<{
  taskId: number;
  capaId: number;
  incidentId: number;
}>;

export type UpdateCapaTaskStatusInput = Readonly<{
  taskId: number;
  capaId: number;
  incidentId?: number;
  status: CapaTaskStatus;
}>;

export type UpdateCapaTaskInput = Readonly<{
  taskId: number;
  capaId: number;
  incidentId?: number;
  task: string;
  dueDate: string;
  priority?: string;
}>;

export type DropCapaInput = Readonly<{
  capaId: number;
}>;

export function useUploadCapaAttachmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadCapaAttachmentsInput) => {
      const auth = getAuthContext();
      if (!auth || auth.userId <= 0) {
        throw new Error("Sign in required to upload CAPA attachments.");
      }

      if (!Number.isFinite(input.capaId) || input.capaId <= 0) {
        throw new Error("CAPA id is required to upload attachments.");
      }

      const attachments = formAttachmentValuesToDtos(input.attachments);
      if (attachments.length === 0) {
        throw new Error("Add at least one uploaded file before saving.");
      }

      return uploadCapaAttachments({
        capaId: Math.trunc(input.capaId),
        userId: auth.userId,
        attachments,
      });
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.attachments(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byId(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
    },
  });
}

export function useCreateCapaCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaCommentInput) => {
      const auth = getAuthContext();
      if (!auth || auth.userId <= 0) {
        throw new Error("Sign in required to post a CAPA comment.");
      }

      const description = input.description.trim();
      if (!description) {
        throw new Error("Comment text is required.");
      }

      if (!Number.isFinite(input.capaId) || input.capaId <= 0) {
        throw new Error("CAPA id is required to post a comment.");
      }

      const assignedId =
        Number.isFinite(input.assignedId) && input.assignedId > 0
          ? Math.trunc(input.assignedId)
          : auth.userId;

      // POST /api/v1/capas/{capaId}/comments — body matches OpenAPI CapaCommentDto.
      return createCapaComment({
        capaId: Math.trunc(input.capaId),
        title: input.title?.trim() || "Comment",
        description,
        userId: auth.userId,
        assignedId,
      });
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [...capaQueryKeys.all, "comments"],
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byId(variables.capaId),
      });
    },
  });
}

export function useCreateCapaTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaTaskInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA task.");
      }

      return createCapaTask(
        buildCreateCapaTaskRequest({
          capaId: input.capaId,
          task: input.task,
          dueDate: input.dueDate,
          priority: input.priority,
        }),
      );
    },
    onSuccess: async (_result, variables) => {
      if (variables.incidentId && variables.incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(variables.incidentId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useDeleteCapaTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteCapaTaskInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to delete a CAPA task.");
      }

      return deleteCapaTask(input.taskId);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useUpdateCapaTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCapaTaskStatusInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to update a CAPA task status.");
      }

      return updateCapaTaskStatus(
        buildUpdateCapaTaskStatusRequest({
          taskId: input.taskId,
          status: input.status,
        }),
      );
    },
    onSuccess: async (_result, variables) => {
      if (variables.incidentId && variables.incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(variables.incidentId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byId(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useUpdateCapaTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCapaTaskInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to update a CAPA task.");
      }

      return updateCapaTask(
        buildUpdateCapaTaskRequest({
          id: input.taskId,
          capaId: input.capaId,
          task: input.task,
          dueDate: input.dueDate,
          priority: input.priority,
        }),
      );
    },
    onSuccess: async (_result, variables) => {
      if (variables.incidentId && variables.incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(variables.incidentId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byId(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useDropCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DropCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to drop a CAPA.");
      }

      return dropCapa(input.capaId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useCreateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to create a CAPA.");
      }

      const capa = await createCapa(input.payload);
      console.log("capa", capa);

      if (capa?.id) {
        for (const task of input.tasks ?? []) {
          const trimmedTask = task.task.trim();
          if (!trimmedTask) {
            continue;
          }

          await createCapaTask(
            buildCreateCapaTaskRequest({
              capaId: capa.id,
              task: trimmedTask,
              dueDate: task.dueDate,
              priority: task.priority,
            }),
          );
        }
      }

      return capa;
    },
    onSuccess: async (result, variables) => {
      const incidentId = variables.payload.incidentId ?? 0;
      if (incidentId > 0) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.byIncident(incidentId),
        });
      }
      if (result?.id) {
        await queryClient.invalidateQueries({
          queryKey: capaQueryKeys.tasks(result.id),
        });
      }
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useUpdateCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to update a CAPA.");
      }

      const payload = buildUpdateCapaRequest(input);
      return updateCapa(payload);
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.capa.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export type VerifyCapaInput = Readonly<{
  capa: CapaItem;
  incidentId: number;
  effectiveness: CapaEffectiveness;
  notes?: string;
}>;

export type SubmitCapaVerificationInput = Readonly<{
  capaId: number;
  effectiveness: CapaEffectiveness;
  notes?: string;
  checklist?: readonly { item: string; isChecked: boolean }[];
}>;

/** POST /api/v1/capas/{capaId}/verification — used by the CAPA detail verify page. */
export function useSubmitCapaVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitCapaVerificationInput) => {
      return submitCapaVerification(
        buildCapaVerificationRequest({
          capaId: input.capaId,
          effectiveness: input.effectiveness,
          notes: input.notes,
          checklist: input.checklist,
        }),
      );
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.verification(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byId(variables.capaId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capaId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}

export function useVerifyCapaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VerifyCapaInput) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to verify a CAPA.");
      }

      await submitCapaVerification(
        buildCapaVerificationRequest({
          capaId: input.capa.numericId,
          effectiveness: input.effectiveness,
          notes: input.notes,
        }),
      );

      return updateCapa(buildVerifiedCapaUpdateRequest(input.capa));
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.byIncident(variables.incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.review(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({
        queryKey: capaQueryKeys.tasks(variables.capa.numericId),
      });
      await queryClient.invalidateQueries({ queryKey: capaQueryKeys.all });
    },
  });
}
