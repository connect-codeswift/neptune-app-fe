"use client";

import {
  CAPA_ATTACHMENTS_FORM_ID,
  CAPA_ATTACHMENTS_SCHEMA,
} from "@/components/capa/detail/capa-attachments-schema";
import { CapaDetailAddTaskModal } from "@/components/capa/detail/CapaDetailAddTaskModal";
import {
  type CapaDetailComment,
  type CapaDetailRecord,
  type CapaDetailTask,
  type CapaDetailTaskStatus,
} from "@/components/capa/detail/capa-detail-data";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCreateCapaCommentMutation,
  useCreateCapaTaskMutation,
  useUpdateCapaTaskMutation,
  useUpdateCapaTaskStatusMutation,
  useUploadCapaAttachmentsMutation,
} from "@/hooks/use-capa-mutations";
import {
  useCapaAttachmentsQuery,
  useCapaCommentsQuery,
  useCapaTasksQuery,
} from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  capaAttachmentToFormValue,
  mapCapaCommentDtoToDetailComment,
  mapCapaTaskDtoToDetailTask,
  toCapaTaskStatusFromDetail,
} from "@/services/mappers/capa.mapper";
import { Icon } from "@iconify/react";
import { useMemo, useState, type ReactNode } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const TASK_STATUS_CLASS: Record<CapaDetailTaskStatus, string> = {
  Completed: "bg-[rgba(5,223,114,0.1)] text-[#10b981]",
  "In Progress": "bg-[rgba(253,199,0,0.1)] text-[#f59e0b]",
  "Not Started": "bg-[rgba(238,241,246,0.6)] text-[#566072]",
};

const TASK_STATUS_OPTIONS: readonly CapaDetailTaskStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
];

function parseTaskId(id: string): number | null {
  const parsed = Number.parseInt(id, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const taskColumnHelper = createColumnHelper<CapaDetailTask>();

function buildTaskColumns(
  options: Readonly<{
    pendingTaskId: number | null;
    onStatusChange: (
      task: CapaDetailTask,
      status: CapaDetailTaskStatus,
    ) => void;
    onEdit: (task: CapaDetailTask) => void;
  }>,
): ColumnDef<CapaDetailTask, unknown>[] {
  return [
    taskColumnHelper.accessor("label", {
      header: "Task",
      size: 200,
      cell: (info) => {
        const task = info.row.original;
        const done = task.status === "Completed";

        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-3.25 shrink-0 rounded-xs border border-[rgba(15,23,42,0.12)] bg-[rgba(255,255,255,0.62)]"
              aria-hidden
            />
            <span
              className={[
                "text-base leading-5",
                done ? "text-[#8892a3] line-through" : "text-[#2a3446]",
              ].join(" ")}
            >
              {info.getValue()}
            </span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    taskColumnHelper.accessor("owner", {
      header: "Owner",
      size: 160,
      cell: (info) => (
        <span className="text-base leading-4 text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    taskColumnHelper.accessor("dueDate", {
      header: "Due Date",
      size: 110,
      cell: (info) => (
        <span className="text-base leading-4 text-[#566072] tabular-nums">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    taskColumnHelper.accessor("status", {
      header: "Status",
      size: 140,
      cell: (info) => {
        const task = info.row.original;
        const taskId = parseTaskId(task.id);
        const isPending = taskId != null && options.pendingTaskId === taskId;

        return (
          <select
            aria-label={`Status for ${task.label}`}
            value={task.status}
            disabled={isPending || options.pendingTaskId != null}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              const next = event.target.value as CapaDetailTaskStatus;
              if (next === task.status) return;
              options.onStatusChange(task, next);
            }}
            className={[
              "rounded px-2 py-0.5 text-base leading-4 font-medium outline-none",
              TASK_STATUS_CLASS[task.status],
              "disabled:cursor-not-allowed disabled:opacity-60",
            ].join(" ")}
          >
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        );
      },
      meta: { align: "left" as const },
    }),
    taskColumnHelper.display({
      id: "edit",
      header: "",
      size: 44,
      cell: (info) => (
        <button
          type="button"
          aria-label={`Edit ${info.row.original.label}`}
          onClick={(event) => {
            event.stopPropagation();
            options.onEdit(info.row.original);
          }}
          className="inline-flex size-7 items-center justify-center rounded-lg text-[#566072] transition-colors hover:bg-[rgba(8,145,166,0.08)] hover:text-[#0891a6]"
        >
          <Icon icon="mdi:pencil-outline" className="size-4" aria-hidden />
        </button>
      ),
      meta: { align: "right" as const },
    }),
  ] as ColumnDef<CapaDetailTask, unknown>[];
}

function SectionBlock(
  props: Readonly<{
    title: string;
    children: ReactNode;
    muted?: boolean;
  }>,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text
        as="h4"
        className="text-sm font-medium tracking-[0.3px] text-[#0891a6] uppercase"
      >
        {props.title}
      </Text>
      <div
        className={[
          "text-base leading-[22.75px] text-[#2a3446]",
          props.muted ? "rounded-2.5 bg-[#f6f6f6] px-3 py-3" : "px-3 py-3",
        ].join(" ")}
      >
        {props.children}
      </div>
    </div>
  );
}

/** Details tab — Figma 1368:3178. */
export function CapaDetailDetailsTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;

  return (
    <div className="flex flex-col gap-5 px-5.25 pt-5.25 pb-5">
      <SectionBlock title="Problem Statement" muted>
        {record.problemStatement}
      </SectionBlock>
      <SectionBlock title="Root Cause">{record.rootCause}</SectionBlock>
      <SectionBlock title="Proposed Action">
        {record.proposedAction}
      </SectionBlock>
      <SectionBlock title="Required Resources">
        {record.requiredResources}
      </SectionBlock>
      <SectionBlock title="Expected Outcome">
        {record.expectedOutcome}
      </SectionBlock>
    </div>
  );
}

/** Tasks tab — Figma 1370:3750. Loads GET /api/v1/capas/{capaId}/tasks. */
export function CapaDetailTasksTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CapaDetailTask | null>(null);
  const createCapaTaskMutation = useCreateCapaTaskMutation();
  const updateCapaTaskMutation = useUpdateCapaTaskMutation();
  const updateTaskStatusMutation = useUpdateCapaTaskStatusMutation();
  const hasToken = useHasAccessToken();
  const pendingTaskId = updateTaskStatusMutation.isPending
    ? (updateTaskStatusMutation.variables?.taskId ?? null)
    : null;

  const tasksQuery = useCapaTasksQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    enabled: hasToken === true && record.numericId > 0,
  });

  const tasks = useMemo(
    () =>
      (tasksQuery.data ?? []).map((task) =>
        mapCapaTaskDtoToDetailTask(task, {
          fallbackOwner: record.owner,
          fallbackDueDate: record.dueDate,
        }),
      ),
    [tasksQuery.data, record.owner, record.dueDate],
  );

  async function handleStatusChange(
    task: CapaDetailTask,
    status: CapaDetailTaskStatus,
  ) {
    const taskId = parseTaskId(task.id);
    if (!taskId || record.numericId <= 0) {
      toast.error(
        "Could not update task status",
        "This task is missing a server id. Refresh and try again.",
      );
      return;
    }

    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        capaId: record.numericId,
        incidentId: record.incidentId,
        status: toCapaTaskStatusFromDetail(status),
      });
      toast.success("Task status updated");
    } catch (error) {
      toast.error(
        "Could not update task status",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  }

  const columns = buildTaskColumns({
    pendingTaskId,
    onStatusChange: (task, status) => {
      void handleStatusChange(task, status);
    },
    onEdit: setEditingTask,
  });

  const doneCount = tasks.filter((task) => task.status === "Completed").length;
  const isLoading =
    hasToken === true &&
    record.numericId > 0 &&
    (tasksQuery.isLoading ||
      (tasksQuery.isFetching && tasksQuery.data === undefined));

  if (isLoading) {
    return (
      <div className="px-5.25 pt-5.25 pb-5">
        <Text as="p" className="text-sm text-[#8892a3]">
          Loading tasks…
        </Text>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="px-5.25 pt-5.25 pb-5">
        <Text as="p" className="text-sm text-[#ef4444]">
          {getMutationErrorMessage(tasksQuery.error, "Could not load tasks.")}
        </Text>
      </div>
    );
  }

  return (
    <>
      {tasks.length === 0 ? (
        <div className="px-5.25 pt-5.25 pb-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Text as="p" className="text-base leading-5 text-[#566072]">
              0 of 0 tasks completed
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddTaskOpen(true)}
              disabled={createCapaTaskMutation.isPending}
              className="rounded-xl border border-[rgba(43,127,255,0.3)] bg-transparent px-3 py-2! text-sm font-medium text-[#0891a6]! shadow-none hover:bg-[rgba(8,145,166,0.06)]"
            >
              <Icon icon="mdi:plus" className="size-3" aria-hidden />
              Add Task
            </Button>
          </div>
          <Text as="p" className="py-6 text-center text-sm text-[#8892a3]">
            No tasks yet.
          </Text>
        </div>
      ) : (
        <Table
          data={tasks}
          columns={columns}
          getRowId={(row) => row.id}
          variant="capa"
          containerClassName="!rounded-none !border-0 !bg-transparent !shadow-none !backdrop-blur-none before:!hidden"
          header={
            <div className="flex items-center justify-between gap-3">
              <Text as="p" className="text-base leading-5 text-[#566072]">
                {`${String(doneCount)} of ${String(tasks.length)} tasks completed`}
              </Text>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddTaskOpen(true)}
                disabled={createCapaTaskMutation.isPending}
                className="rounded-xl border border-[rgba(43,127,255,0.3)] bg-transparent px-3 py-2! text-sm font-medium text-[#0891a6]! shadow-none hover:bg-[rgba(8,145,166,0.06)]"
              >
                <Icon icon="mdi:plus" className="size-3" aria-hidden />
                Add Task
              </Button>
            </div>
          }
        />
      )}

      {isAddTaskOpen ? (
        <CapaDetailAddTaskModal
          onClose={() => setIsAddTaskOpen(false)}
          isSubmitting={createCapaTaskMutation.isPending}
          onAssign={async (draft) => {
            if (record.numericId <= 0) {
              toast.error(
                "Could not add task",
                "This CAPA is missing a server id. Refresh and try again.",
              );
              throw new Error("Missing CAPA numeric id");
            }

            try {
              await createCapaTaskMutation.mutateAsync({
                capaId: record.numericId,
                incidentId: record.incidentId,
                task: draft.name,
                owner: draft.assigneeUserId,
                dueDate: draft.dueDate,
                priority: draft.priority,
              });
              toast.success("Task added", `New task linked to ${record.code}.`);
            } catch (error) {
              toast.error(
                "Could not add task",
                getMutationErrorMessage(error, "Please try again."),
              );
              throw error;
            }
          }}
        />
      ) : null}

      {editingTask ? (
        <CapaDetailAddTaskModal
          title="Edit Task"
          confirmLabel="Save Task"
          initialDraft={{
            name: editingTask.label,
            assigneeName: editingTask.owner === "—" ? "" : editingTask.owner,
            assigneeUserId:
              editingTask.ownerId != null && editingTask.ownerId > 0
                ? String(editingTask.ownerId)
                : "",
            dueDate: editingTask.dueDateIso || editingTask.dueDate,
            priority: editingTask.priority || "Medium",
          }}
          isSubmitting={updateCapaTaskMutation.isPending}
          onClose={() => setEditingTask(null)}
          onAssign={async (draft) => {
            const taskId = parseTaskId(editingTask.id);
            if (!taskId || record.numericId <= 0) {
              toast.error(
                "Could not update task",
                "This task is missing a server id. Refresh and try again.",
              );
              throw new Error("Missing CAPA task id");
            }

            try {
              await updateCapaTaskMutation.mutateAsync({
                taskId,
                capaId: record.numericId,
                incidentId: record.incidentId,
                task: draft.name,
                owner: draft.assigneeUserId,
                dueDate: draft.dueDate,
                priority: draft.priority,
              });
              toast.success("Task updated");
            } catch (error) {
              toast.error(
                "Could not update task",
                getMutationErrorMessage(error, "Please try again."),
              );
              throw error;
            }
          }}
        />
      ) : null}
    </>
  );
}

/** Comments tab — Figma 1370:4365. List GET /Comments; post POST /Comment. */
export function CapaDetailCommentsTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;
  const [draft, setDraft] = useState("");
  const hasToken = useHasAccessToken();
  const createCommentMutation = useCreateCapaCommentMutation();
  const userDropdownQuery = useUserDropdownQuery(hasToken === true);

  const commentsQuery = useCapaCommentsQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    userId: record.userId,
    assignedId: record.assignedId,
    enabled: hasToken === true && record.numericId > 0,
  });

  const userNames = useMemo(
    () => toUserNameLookup(userDropdownQuery.data?.dataModel ?? []),
    [userDropdownQuery.data?.dataModel],
  );

  const comments = useMemo(
    () =>
      (commentsQuery.data ?? []).map((comment, index) =>
        mapCapaCommentDtoToDetailComment(comment, index, userNames),
      ),
    [commentsQuery.data, userNames],
  );

  const isLoading =
    hasToken === true &&
    record.numericId > 0 &&
    (commentsQuery.isLoading ||
      (commentsQuery.isFetching && commentsQuery.data === undefined));

  const canPost =
    Boolean(draft.trim()) &&
    record.numericId > 0 &&
    !createCommentMutation.isPending;

  async function handlePostComment() {
    const body = draft.trim();
    if (!body || record.numericId <= 0) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        capaId: record.numericId,
        assignedId: record.assignedId,
        description: body,
        title: "Comment",
      });
      toast.success("Comment posted");
      setDraft("");
    } catch (error) {
      toast.error(
        "Could not post comment",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 px-5.25 pt-5.25 pb-5">
      {isLoading ? (
        <Text as="p" className="py-6 text-center text-sm text-[#8892a3]">
          Loading comments…
        </Text>
      ) : null}

      {!isLoading && commentsQuery.isError ? (
        <Text as="p" className="py-2 text-center text-sm text-[#ef4444]">
          {getMutationErrorMessage(
            commentsQuery.error,
            "Could not load comments.",
          )}
        </Text>
      ) : null}

      {!isLoading && !commentsQuery.isError && comments.length === 0 ? (
        <Text as="p" className="py-6 text-center text-base text-[#8892a3]">
          No comments yet.
        </Text>
      ) : null}

      {!isLoading && !commentsQuery.isError
        ? comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        : null}

      <div className="flex items-start gap-3 border-t border-white/90 pt-2">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0891a6] text-white">
          <Icon icon="mdi:account" className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="Add a comment or progress update…"
            disabled={createCommentMutation.isPending}
            className="rounded-2.5 min-h-14.25 w-full resize-none border border-[rgba(15,23,42,0.1)] bg-[#eef1f6] px-3 py-4 text-base leading-5 text-[#0b1320] outline-none placeholder:text-[#8892a3] focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20 disabled:opacity-60"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              disabled={!canPost}
              onClick={() => {
                void handlePostComment();
              }}
              className="rounded-2.5 px-3.5 text-sm font-medium shadow-[0px_6px_18px_-6px_#0891a6]"
            >
              {createCommentMutation.isPending ? "Posting…" : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentCard(props: Readonly<{ comment: CapaDetailComment }>) {
  const { comment } = props;

  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef1f6] text-[#8892a3]">
        <Icon icon="mdi:account" className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl bg-[rgba(238,241,246,0.7)] px-3 pt-3 pb-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <Text
            as="span"
            className="shrink-0 text-base leading-5 font-medium text-[#0b1320]"
          >
            {comment.author}
          </Text>
          <Text
            as="span"
            className="min-w-0 truncate text-sm leading-4 text-[#8892a3]"
          >
            {comment.role}
          </Text>
          <Text
            as="span"
            className="ml-auto shrink-0 text-base leading-4 text-[#45556c]"
          >
            {comment.timestamp}
          </Text>
        </div>
        <Text as="p" className="text-base leading-[22.75px] text-[#2a3446]">
          {comment.body}
        </Text>
      </div>
    </div>
  );
}

/** Attachments tab — Figma 1370:5176. GET Attachments; POST UploadCapaAttachments. */
export function CapaDetailAttachmentsTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;
  const hasToken = useHasAccessToken();
  const uploadAttachmentsMutation = useUploadCapaAttachmentsMutation();
  const userDropdownQuery = useUserDropdownQuery(hasToken === true);

  const attachmentsQuery = useCapaAttachmentsQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    enabled: hasToken === true && record.numericId > 0,
  });

  const userNames = useMemo(
    () => toUserNameLookup(userDropdownQuery.data?.dataModel ?? []),
    [userDropdownQuery.data?.dataModel],
  );

  const isLoading =
    hasToken === true &&
    record.numericId > 0 &&
    (attachmentsQuery.isLoading ||
      (attachmentsQuery.isFetching && attachmentsQuery.data === undefined));

  const initialValues = useMemo(
    () => ({
      attachments: (attachmentsQuery.data ?? []).map((file) =>
        capaAttachmentToFormValue(file, userNames),
      ),
    }),
    [attachmentsQuery.data, userNames],
  );

  async function handleSubmit(values: FormValues) {
    if (record.numericId <= 0) {
      toast.error(
        "Could not save attachments",
        "This CAPA is missing a server id. Refresh and try again.",
      );
      return;
    }

    try {
      await uploadAttachmentsMutation.mutateAsync({
        capaId: record.numericId,
        attachments: values.attachments,
      });
      toast.success("Attachments saved");
    } catch (error) {
      toast.error(
        "Could not save attachments",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  }

  if (isLoading) {
    return (
      <div className="px-5.25 pt-5.25 pb-5">
        <Text as="p" className="text-sm text-[#8892a3]">
          Loading attachments…
        </Text>
      </div>
    );
  }

  if (attachmentsQuery.isError) {
    return (
      <div className="px-5.25 pt-5.25 pb-5">
        <Text as="p" className="text-sm text-[#ef4444]">
          {getMutationErrorMessage(
            attachmentsQuery.error,
            "Could not load attachments.",
          )}
        </Text>
      </div>
    );
  }

  return (
    <div className="px-5.25 pt-5.25 pb-5">
      <FormBuilder
        key={`${record.id}-${String(attachmentsQuery.dataUpdatedAt)}-${String(userNames.size)}`}
        formId={CAPA_ATTACHMENTS_FORM_ID}
        schema={CAPA_ATTACHMENTS_SCHEMA}
        initialValues={initialValues}
        submitLabel="Save Attachments"
        isSubmitting={uploadAttachmentsMutation.isPending}
        className="gap-5!"
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />
    </div>
  );
}
