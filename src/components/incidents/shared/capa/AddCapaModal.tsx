"use client";

import { useState } from "react";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import { type ControlLevel } from "@/components/incidents/shared/capa/CapaHierarchySelector";
import {
  CapaControlLevelStep,
  CapaCoreFields,
  CapaStepHeading,
  CAPA_PRIORITY_OPTIONS,
  CAPA_TYPE_OPTIONS,
  resolveCapaFooterHint,
  type CapaCoreFieldsValue,
} from "@/components/capa/shared/CapaFormSteps";
import {
  AddTaskModal,
  type CapaTaskFormPayload,
} from "@/components/incidents/shared/capa/AddTaskModal";
import { CapaModalTasksSection } from "@/components/incidents/shared/capa/CapaModalTasksSection";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import { cantBePast, mmDdYyyyToIso } from "@/lib/date-time-field";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import { useCapaTasksQuery } from "@/hooks/use-capa-queries";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { toSelectorControlLevel } from "@/services/mappers/capa.mapper";

export type { CapaTaskFormPayload };

export type CapaFormPayload = Readonly<{
  controlLevel: ControlLevel;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
  tasks?: readonly CapaTaskFormPayload[];
}>;

export type StagedCapaTask = CapaTaskFormPayload &
  Readonly<{
    localId: string;
  }>;

export type AddCapaModalProps = Readonly<{
  sourceLabel: string;
  sourceTitle: string;
  capaId?: string;
  capaToEdit?: CapaItem;
  isSubmitting?: boolean;
  isCreatingTask?: boolean;
  isDeletingTask?: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaFormPayload) => void | Promise<void>;
  onCreateTask?: (payload: CapaTaskFormPayload) => void | Promise<void>;
  onDeleteTask?: (taskId: number) => void | Promise<void>;
}>;

const TYPE_OPTIONS = CAPA_TYPE_OPTIONS;
const PRIORITY_OPTIONS = CAPA_PRIORITY_OPTIONS;

type CapaModalFormProps = Readonly<{
  sourceLabel: string;
  sourceTitle: string;
  capaId: string;
  capaToEdit?: CapaItem;
  isSubmitting: boolean;
  initialDescription: string;
  initialOwner: string;
  initialOwnerUserId: string;
  initialDueDate: string;
  savedTasks: readonly CapaTaskDto[];
  stagedTasks: readonly StagedCapaTask[];
  onOpenAddTask: () => void;
  onRemoveStagedTask: (localId: string) => void;
  onEditStagedTask: (localId: string) => void;
  onDeleteSavedTask?: (taskId: number) => void | Promise<void>;
  isCreatingTask: boolean;
  isDeletingTask: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaFormPayload) => void | Promise<void>;
  onDueDateChange?: (dueDate: string) => void;
}>;

function CapaModalForm(props: Readonly<CapaModalFormProps>) {
  const {
    sourceLabel,
    sourceTitle,
    capaId,
    capaToEdit,
    isSubmitting,
    initialDescription,
    initialOwner,
    initialOwnerUserId,
    initialDueDate,
    savedTasks,
    stagedTasks,
    onOpenAddTask,
    onRemoveStagedTask,
    onEditStagedTask,
    onDeleteSavedTask,
    isCreatingTask,
    isDeletingTask,
    onClose,
    onSubmit,
    onDueDateChange,
  } = props;

  const isEditMode = capaToEdit != null;
  const auth = getAuthContext();
  const currentUserId = auth && auth.userId > 0 ? auth.userId : null;

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(() =>
    capaToEdit ? toSelectorControlLevel(capaToEdit.controlCategory) : null,
  );
  const [fields, setFields] = useState<CapaCoreFieldsValue>(() => ({
    description: initialDescription,
    type: capaToEdit?.actionType ?? TYPE_OPTIONS[0],
    owner: initialOwner,
    ownerUserId: initialOwnerUserId,
    dueDate: initialDueDate,
    priority: capaToEdit?.priority ?? PRIORITY_OPTIONS[1],
  }));
  const { description, type, owner, ownerUserId, dueDate, priority } = fields;
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const patchFields = (patch: Partial<CapaCoreFieldsValue>) => {
    setFields((current) => ({ ...current, ...patch }));
    if (patch.dueDate !== undefined) {
      // The Add Task modal is a sibling, so it needs this pushed up to cap its
      // own date picker against it.
      onDueDateChange?.(patch.dueDate);
    }
  };

  const busy =
    isSubmitting || isLocalSubmitting || isCreatingTask || isDeletingTask;
  // A CAPA's status is derived from its tasks, so one with none can never leave Open. The
  // standalone create screen has always refused to submit without a task; this modal did not,
  // so the same rule depended on which route you came in through. Editing is exempt: the tasks
  // already exist and are managed on the detail page.
  const hasAtLeastOneTask = isEditMode || stagedTasks.length > 0;
  // minDate only greys the calendar out — the field still accepts typed input,
  // so the rule is re-checked here. An already-saved past date is left alone:
  // editing an old CAPA must not be blocked by a deadline that has since passed.
  const isDueDateUnchanged = dueDate === initialDueDate;
  const dueDateError = isDueDateUnchanged
    ? null
    : cantBePast(mmDdYyyyToIso(dueDate), "Due date").error;
  const canSubmit =
    controlLevel != null &&
    description.trim().length > 0 &&
    hasAtLeastOneTask &&
    dueDateError === null &&
    !busy;
  const modalCapaId = capaToEdit?.code ?? capaId;

  const handleSubmit = async () => {
    if (!controlLevel || !canSubmit) {
      return;
    }

    const resolvedOwnerId = Number(ownerUserId.trim());
    if (
      currentUserId != null &&
      Number.isFinite(resolvedOwnerId) &&
      resolvedOwnerId === currentUserId
    ) {
      const title = isEditMode
        ? "Could not save CAPA"
        : "Could not create CAPA";
      toast.error(
        title,
        "A CAPA cannot be assigned to yourself. Pick a different owner.",
      );
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit?.({
        controlLevel,
        description: description.trim(),
        type,
        owner: ownerUserId.trim() || owner.trim(),
        dueDate,
        priority,
        tasks: isEditMode
          ? undefined
          : stagedTasks.map((task) => ({
              task: task.task,
              dueDate: task.dueDate,
              priority: task.priority,
            })),
      });
      onClose();
    } catch {
      // Keep the modal open so the user can retry after an error toast.
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  return (
    <IncidentModalShell
      title={isEditMode ? "Edit CAPA" : "Create CAPA"}
      subtitle={`${sourceLabel} · ${sourceTitle} · ${isEditMode ? modalCapaId : `new ${capaId}`}`}
      onClose={onClose}
      footerHint={resolveCapaFooterHint({
        controlLevel,
        description,
        hasAtLeastOneTask,
      })}
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} />
          <IncidentModalPrimaryButton
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            label={
              busy
                ? isEditMode
                  ? "Saving…"
                  : "Adding…"
                : isEditMode
                  ? "Save changes"
                  : "Add CAPA"
            }
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12">
        <section className="min-w-0">
          <CapaControlLevelStep
            value={controlLevel}
            onChange={setControlLevel}
          />
        </section>

        <section className="min-w-0">
          <CapaStepHeading
            step="2"
            title="What CAPA is needed?"
            className="mb-4 sm:mb-6"
          />

          <CapaCoreFields
            value={fields}
            onChange={patchFields}
            dueDateError={dueDateError}
          />
        </section>

        {/* Its own row, as on the standalone create page: a checklist reads
            badly in a half-width column beside the triangle. */}
        <section className="min-w-0 md:col-span-2">
          <CapaModalTasksSection
            heading={<CapaStepHeading step="3" title="Tasks Checklist" />}
            isEditMode={isEditMode}
            savedTasks={savedTasks}
            stagedTasks={stagedTasks}
            busy={busy}
            onOpenAddTask={onOpenAddTask}
            onRemoveStagedTask={onRemoveStagedTask}
            onEditStagedTask={onEditStagedTask}
            onDeleteSavedTask={onDeleteSavedTask}
            capaPriority={capaToEdit?.priority ?? priority}
          />
        </section>
      </div>
    </IncidentModalShell>
  );
}

export function AddCapaModal(props: Readonly<AddCapaModalProps>) {
  const {
    sourceLabel,
    sourceTitle,
    capaId = "CAPA-0423",
    capaToEdit,
    isSubmitting = false,
    isCreatingTask = false,
    isDeletingTask = false,
    onClose,
    onSubmit,
    onCreateTask,
    onDeleteTask,
  } = props;

  const isEditMode = capaToEdit != null;
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  // Which staged row the task modal is correcting. Null means it is adding a new one.
  const [editingTaskLocalId, setEditingTaskLocalId] = useState<string | null>(
    null,
  );
  const [stagedTasks, setStagedTasks] = useState<readonly StagedCapaTask[]>([]);
  const tasksQuery = useCapaTasksQuery({
    capaId: capaToEdit?.numericId ?? null,
    enabled: isEditMode,
  });

  const handleAddTask = async (payload: CapaTaskFormPayload) => {
    if (isEditMode) {
      await onCreateTask?.(payload);
      return;
    }

    if (editingTaskLocalId !== null) {
      setStagedTasks((previous) =>
        previous.map((task) =>
          task.localId === editingTaskLocalId
            ? { ...payload, localId: task.localId }
            : task,
        ),
      );
      return;
    }

    setStagedTasks((previous) => [
      ...previous,
      {
        ...payload,
        localId: crypto.randomUUID(),
      },
    ]);
  };

  const handleEditStagedTask = (localId: string) => {
    setEditingTaskLocalId(localId);
    setIsAddTaskOpen(true);
  };

  const closeTaskModal = () => {
    setIsAddTaskOpen(false);
    setEditingTaskLocalId(null);
  };

  const handleRemoveStagedTask = (localId: string) => {
    setStagedTasks((previous) =>
      previous.filter((task) => task.localId !== localId),
    );
  };

  const handleDeleteSavedTask = async (taskId: number) => {
    await onDeleteTask?.(taskId);
  };

  const addTaskCapaCode =
    isEditMode && capaToEdit ? capaToEdit.code : `new ${capaId}`;
  const savedTasks = tasksQuery.data ?? [];
  const initialDescription = capaToEdit?.description ?? "";
  const initialOwner = capaToEdit?.assignee ?? "";
  const initialOwnerUserId =
    capaToEdit?.assignedId != null ? String(capaToEdit.assignedId) : "";
  const initialDueDate =
    capaToEdit?.dueDate && capaToEdit.dueDate !== "—" ? capaToEdit.dueDate : "";

  // Mirrored from the form below so Add Task can cap its picker at the CAPA's own date.
  const [capaDueDate, setCapaDueDate] = useState(initialDueDate);

  return (
    <>
      <CapaModalForm
        key={
          isEditMode
            ? `edit-${capaToEdit.id}-${String(savedTasks.length)}`
            : "add"
        }
        sourceLabel={sourceLabel}
        sourceTitle={sourceTitle}
        capaId={capaId}
        capaToEdit={capaToEdit}
        isSubmitting={isSubmitting}
        initialDescription={initialDescription}
        initialOwner={initialOwner}
        initialOwnerUserId={initialOwnerUserId}
        initialDueDate={initialDueDate}
        savedTasks={savedTasks}
        stagedTasks={stagedTasks}
        onOpenAddTask={() => {
          // The task modal caps its own date picker against the CAPA's due date, so
          // opening it before one is set offers an uncapped picker and lets a task be
          // dated past its parent. The due date is required now, so this is only ever
          // asking for it in the order the form already needs it.
          if (capaDueDate.trim().length === 0) {
            toast.error(
              "Set the CAPA due date first",
              "Tasks are scheduled against it, so it has to be chosen before adding one.",
            );
            return;
          }
          setIsAddTaskOpen(true);
        }}
        onRemoveStagedTask={handleRemoveStagedTask}
        onEditStagedTask={handleEditStagedTask}
        onDeleteSavedTask={isEditMode ? handleDeleteSavedTask : undefined}
        isCreatingTask={isCreatingTask}
        isDeletingTask={isDeletingTask}
        onClose={onClose}
        onSubmit={onSubmit}
        onDueDateChange={setCapaDueDate}
      />

      {isAddTaskOpen && capaDueDate.trim().length > 0 ? (
        <AddTaskModal
          sourceLabel={sourceLabel}
          sourceTitle={sourceTitle}
          capaCode={addTaskCapaCode}
          capaDueDate={capaDueDate}
          isSubmitting={isCreatingTask}
          initialValues={
            stagedTasks.find((task) => task.localId === editingTaskLocalId) ??
            undefined
          }
          onClose={closeTaskModal}
          onSubmit={handleAddTask}
        />
      ) : null}
    </>
  );
}
