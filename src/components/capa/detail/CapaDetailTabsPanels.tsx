"use client";

import {
  CAPA_ATTACHMENTS_FORM_ID,
  CAPA_ATTACHMENTS_SCHEMA,
} from "@/components/capa/detail/capa-attachments-schema";
import { CapaDetailAddTaskModal } from "@/components/capa/detail/CapaDetailAddTaskModal";
import {
  CAPA_FIGMA_ATTACHMENTS,
  type CapaDetailComment,
  type CapaDetailRecord,
  type CapaDetailTask,
  type CapaDetailTaskStatus,
} from "@/components/capa/detail/capa-detail-data";
import { FormBuilder } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaTaskMutation } from "@/hooks/use-capa-mutations";
import { toast } from "@/lib/toast";
import { Icon } from "@iconify/react";
import { useMemo, useState, type ReactNode } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const TASK_STATUS_CLASS: Record<CapaDetailTaskStatus, string> = {
  Completed: "bg-[rgba(5,223,114,0.1)] text-[#10b981]",
  "In Progress": "bg-[rgba(253,199,0,0.1)] text-[#f59e0b]",
  "Not Started": "bg-[rgba(238,241,246,0.6)] text-[#566072]",
};

const taskColumnHelper = createColumnHelper<CapaDetailTask>();

function buildTaskColumns(): ColumnDef<CapaDetailTask, unknown>[] {
  return [
    taskColumnHelper.accessor("label", {
      header: "Task",
      size: 360,
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
                "text-sm leading-5",
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
      size: 130,
      cell: (info) => (
        <span className="text-sm leading-4 text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    taskColumnHelper.accessor("dueDate", {
      header: "Due Date",
      size: 110,
      cell: (info) => (
        <span className="text-sm leading-4 text-[#566072] tabular-nums">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    taskColumnHelper.accessor("status", {
      header: "Status",
      size: 110,
      cell: (info) => (
        <span
          className={[
            "inline-flex rounded px-2 py-0.5 text-sm leading-4 font-medium",
            TASK_STATUS_CLASS[info.getValue()],
          ].join(" ")}
        >
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
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

/** Tasks tab — Figma 1370:3750. */
export function CapaDetailTasksTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;
  const columns = useMemo(() => buildTaskColumns(), []);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const createCapaTaskMutation = useCreateCapaTaskMutation();
  const doneCount = record.tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  return (
    <>
      <Table
        data={record.tasks}
        columns={columns}
        getRowId={(row) => row.id}
        variant="capa"
        containerClassName="!rounded-none !border-0 !bg-transparent !shadow-none !backdrop-blur-none before:!hidden"
        header={
          <div className="flex items-center justify-between gap-3">
            <Text as="p" className="text-base leading-5 text-[#566072]">
              {`${String(doneCount)} of ${String(record.tasks.length)} tasks completed`}
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
              toast.success(
                "Task added",
                `New task linked to ${record.code}.`,
              );
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
    </>
  );
}

/** Comments tab — Figma 1370:4365. */
export function CapaDetailCommentsTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-4 px-5.25 pt-5.25 pb-5">
      {record.comments.length === 0 ? (
        <Text as="p" className="py-6 text-center text-sm text-[#8892a3]">
          No comments yet.
        </Text>
      ) : (
        record.comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))
      )}

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
            className="min-h-14.25 w-full resize-none rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-[#eef1f6] px-3 py-4 text-base leading-5 text-[#0b1320] outline-none placeholder:text-[#8892a3] focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              disabled={!draft.trim()}
              onClick={() => {
                toast.success("Comment posted");
                setDraft("");
              }}
              className="rounded-2.5 px-3.5 text-sm font-medium shadow-[0px_6px_18px_-6px_#0891a6]"
            >
              Post Comment
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
            className="ml-auto shrink-0 text-sm leading-4 text-[#45556c]"
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

/** Attachments tab — Figma 1370:5176 (FormBuilder + Cloudinary). */
export function CapaDetailAttachmentsTab(
  props: Readonly<{ record: CapaDetailRecord }>,
) {
  const { record } = props;

  const initialValues = useMemo(() => {
    const files =
      record.attachments.length > 0
        ? record.attachments
        : CAPA_FIGMA_ATTACHMENTS;

    return {
      attachments: files.map((file) => `${file.name}|||${file.meta}`),
    };
  }, [record.attachments]);

  return (
    <div className="px-5.25 pt-5.25 pb-5">
      <FormBuilder
        key={record.id}
        formId={CAPA_ATTACHMENTS_FORM_ID}
        schema={CAPA_ATTACHMENTS_SCHEMA}
        initialValues={initialValues}
        hideActions
        className="!gap-0"
        onSubmit={() => {
          // Attachments upload live to Cloudinary; no separate submit step.
        }}
      />
    </div>
  );
}
