"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { CapaTaskFormPayload } from "@/components/incidents/shared/capa/AddTaskModal";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";

type StagedCapaTask = CapaTaskFormPayload &
  Readonly<{
    localId: string;
  }>;

type CapaModalTasksSectionProps = Readonly<{
  isEditMode: boolean;
  savedTasks: readonly CapaTaskDto[];
  stagedTasks: readonly StagedCapaTask[];
  busy?: boolean;
  onOpenAddTask: () => void;
  onRemoveStagedTask?: (localId: string) => void;
  /** Staged rows only. A saved task is edited through the permissioned update endpoint. */
  onEditStagedTask?: (localId: string) => void;
  /**
   * Async in practice (AddCapaModal passes a mutation). Typed as such so the
   * returned promise can't be dropped silently the way a bare `void` allows.
   */
  onDeleteSavedTask?: (taskId: number) => void | Promise<void>;
  capaPriority?: string;
  /** Replaces the plain "Tasks Checklist" label — both CAPA forms pass their step heading. */
  heading?: ReactNode;
}>;

function PriorityBadge(props: Readonly<{ priority?: string }>) {
  const label = (props.priority ?? "Medium").toUpperCase();

  return (
    <span className="bg-ehs-gray/14 text-ehs-gray text-2.5 inline-flex shrink-0 rounded-full px-2.5 py-1 font-bold tracking-[0.2px] uppercase">
      {label}
    </span>
  );
}

function ChecklistRow(
  props: Readonly<{
    task: string;
    priority?: string;
    onRemove?: () => void;
    onEdit?: () => void;
  }>,
) {
  const { task, priority, onRemove, onEdit } = props;

  return (
    <div className="border-ehs-border-ink/8 flex items-center gap-3 border-b px-3.5 py-3 last:border-b-0">
      <p className="text-ehs-dark-bg min-w-0 flex-1 text-sm leading-[19.5px]">
        {task}
      </p>
      <PriorityBadge priority={priority} />
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit task ${task}`}
          className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <Icon
            icon="mdi:pencil-outline"
            className="size-4"
            aria-hidden="true"
          />
        </button>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove task ${task}`}
          className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <Icon
            icon="mdi:trash-can-outline"
            className="size-4"
            aria-hidden="true"
          />
        </button>
      ) : (
        <span className="inline-flex size-7 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}

export function CapaModalTasksSection(
  props: Readonly<CapaModalTasksSectionProps>,
) {
  const {
    isEditMode,
    savedTasks,
    stagedTasks,
    busy = false,
    onOpenAddTask,
    onRemoveStagedTask,
    onEditStagedTask,
    onDeleteSavedTask,
    capaPriority,
    heading,
  } = props;

  const hasTasks = isEditMode ? savedTasks.length > 0 : stagedTasks.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        {heading ?? (
          <span className="text-ehs-dark-bg text-base leading-6 font-medium">
            Tasks Checklist
          </span>
        )}
        <button
          type="button"
          onClick={onOpenAddTask}
          disabled={busy}
          className="bg-ehs-normal-blue/10 text-ehs-normal-blue hover:bg-ehs-normal-blue/15 rounded-2.5 inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon icon="mdi:plus" className="size-3.25" aria-hidden="true" />
          Add Task
        </button>
      </div>

      {hasTasks ? (
        <div className="border-ehs-border-ink/8 bg-ehs-surface/80 overflow-hidden rounded-xl border">
          {isEditMode
            ? savedTasks.map((taskItem) => (
                <ChecklistRow
                  key={taskItem.id}
                  task={taskItem.task}
                  priority={capaPriority}
                  onRemove={
                    onDeleteSavedTask
                      ? () => {
                          // The delete handler toasts its own failure and
                          // re-throws; swallow it here so a failed delete
                          // isn't an unhandled rejection.
                          void Promise.resolve(
                            onDeleteSavedTask(taskItem.id),
                          ).catch(() => undefined);
                        }
                      : undefined
                  }
                />
              ))
            : stagedTasks.map((taskItem) => (
                <ChecklistRow
                  key={taskItem.localId}
                  task={taskItem.task}
                  priority={taskItem.priority}
                  onRemove={
                    onRemoveStagedTask
                      ? () => onRemoveStagedTask(taskItem.localId)
                      : undefined
                  }
                  onEdit={
                    onEditStagedTask
                      ? () => onEditStagedTask(taskItem.localId)
                      : undefined
                  }
                />
              ))}
        </div>
      ) : null}
    </div>
  );
}
