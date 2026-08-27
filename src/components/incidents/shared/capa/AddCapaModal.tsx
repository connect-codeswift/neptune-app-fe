"use client";

import { useId, useState } from "react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import {
  CapaHierarchySelector,
  type ControlLevel,
} from "@/components/incidents/shared/capa/CapaHierarchySelector";
import { CapaModalFieldLabel } from "./CapaModalFieldLabel";
import { CapaSegmentedToggle } from "@/components/incidents/shared/capa/CapaSegmentedToggle";
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
import { ReportPersonSearchField } from "@/components/incidents/report/shared/ReportPersonSearchField";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { FIELD_TEXTAREA_WITH_CONTROLS_CLASS } from "@/components/ui/field-styles";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import { useCapaTasksQuery } from "@/hooks/use-capa-queries";
import { useCurrentSite } from "@/hooks/use-current-site";
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

const TYPE_OPTIONS = ["Corrective", "Preventive"] as const;
const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

/** Names the one thing still missing, in the order the form is filled. */
function resolveFooterHint(
  state: Readonly<{
    controlLevel: string | null;
    description: string;
    hasAtLeastOneTask: boolean;
  }>,
): string {
  if (!state.controlLevel) {
    return "Select a control level to continue";
  }
  if (state.description.trim().length === 0) {
    return "Describe the action to continue";
  }
  if (!state.hasAtLeastOneTask) {
    return "Add at least one task to continue";
  }
  return `${state.controlLevel} selected`;
}

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
  onDeleteSavedTask?: (taskId: number) => void | Promise<void>;
  isCreatingTask: boolean;
  isDeletingTask: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaFormPayload) => void | Promise<void>;
  onDueDateChange?: (dueDate: string) => void;
}>;

function StepBadge(props: Readonly<{ step: string }>) {
  const { step } = props;

  return (
    <span className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-6 shrink-0 items-center justify-center rounded-full pt-[2px] pb-[3px] text-sm leading-5">
      {step}
    </span>
  );
}

function FieldLabel(
  props: Readonly<{ children: string; required?: boolean; htmlFor?: string }>,
) {
  return <CapaModalFieldLabel {...props} />;
}

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
    onDeleteSavedTask,
    isCreatingTask,
    isDeletingTask,
    onClose,
    onSubmit,
    onDueDateChange,
  } = props;

  const isEditMode = capaToEdit != null;
  const descriptionFieldId = useId();
  const site = useCurrentSite();
  const auth = getAuthContext();
  const currentUserId = auth && auth.userId > 0 ? auth.userId : null;
  const excludeUserIds =
    currentUserId != null ? [String(currentUserId)] : undefined;

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(() =>
    capaToEdit ? toSelectorControlLevel(capaToEdit.controlCategory) : null,
  );
  const [description, setDescription] = useState(initialDescription);
  const [type, setType] = useState<string>(
    () => capaToEdit?.actionType ?? TYPE_OPTIONS[0],
  );
  const [owner, setOwner] = useState(initialOwner);
  const [ownerUserId, setOwnerUserId] = useState(initialOwnerUserId);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState<string>(
    () => capaToEdit?.priority ?? PRIORITY_OPTIONS[1],
  );
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const busy =
    isSubmitting || isLocalSubmitting || isCreatingTask || isDeletingTask;
  // A CAPA's status is derived from its tasks, so one with none can never leave Open. The
  // standalone create screen has always refused to submit without a task; this modal did not,
  // so the same rule depended on which route you came in through. Editing is exempt: the tasks
  // already exist and are managed on the detail page.
  const hasAtLeastOneTask = isEditMode || stagedTasks.length > 0;
  const canSubmit =
    controlLevel != null &&
    description.trim().length > 0 &&
    hasAtLeastOneTask &&
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
      footerHint={resolveFooterHint({
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
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8 lg:gap-12">
        <section className="w-full shrink-0 md:w-80 lg:w-95">
          <div className="mb-4 flex flex-col gap-1.25 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <StepBadge step="1" />
              <Text
                as="h3"
                className="text-ehs-dark-bg text-base leading-6 font-normal sm:text-base"
              >
                Select control level
              </Text>
            </div>
            <Text
              as="p"
              className="text-ehs-gray text-sm leading-[19.5px] font-normal sm:text-sm"
            >
              Most → least effective. Prefer higher-order controls.
            </Text>
          </div>

          <CapaHierarchySelector
            value={controlLevel}
            onChange={setControlLevel}
          />
        </section>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2.5 sm:mb-6">
            <StepBadge step="2" />
            <Text
              as="h3"
              className="text-ehs-dark-bg text-base leading-6 font-normal sm:text-base"
            >
              What CAPA is needed?
            </Text>
          </div>

          <div className="flex flex-col gap-4.5">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={descriptionFieldId} required>
                Action description
              </FieldLabel>
              <div className="relative">
                <textarea
                  id={descriptionFieldId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the corrective / preventive action..."
                  rows={3}
                  className={FIELD_TEXTAREA_WITH_CONTROLS_CLASS}
                />
                <AiTextAssistant
                  module="incident"
                  value={description}
                  onApply={setDescription}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Type</FieldLabel>
              <CapaSegmentedToggle
                ariaLabel="CAPA type"
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <ReportPersonSearchField
                variant="embedded"
                label="Assigned"
                value={owner}
                selectedUserId={ownerUserId}
                onChange={({ name, userId }) => {
                  setOwner(name);
                  setOwnerUserId(userId);
                }}
                siteId={site.id}
                siteName={site.name}
                placeholder="e.g. M. Torres"
                excludeUserIds={excludeUserIds}
              />

              <ReportDateField
                variant="embedded"
                label="Due date"
                value={dueDate}
                onChange={(next) => {
                  setDueDate(next);
                  // The Add Task modal is a sibling, so it needs this pushed up to cap its
                  // own date picker against it.
                  onDueDateChange?.(next);
                }}
                placeholder="MM/DD/YYYY"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Priority</FieldLabel>
              <CapaSegmentedToggle
                ariaLabel="CAPA priority"
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={setPriority}
              />
            </div>

            <CapaModalTasksSection
              isEditMode={isEditMode}
              savedTasks={savedTasks}
              stagedTasks={stagedTasks}
              busy={busy}
              onOpenAddTask={onOpenAddTask}
              onRemoveStagedTask={onRemoveStagedTask}
              onDeleteSavedTask={onDeleteSavedTask}
              capaPriority={capaToEdit?.priority ?? priority}
            />
          </div>
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

    setStagedTasks((previous) => [
      ...previous,
      {
        ...payload,
        localId: crypto.randomUUID(),
      },
    ]);
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
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onRemoveStagedTask={handleRemoveStagedTask}
        onDeleteSavedTask={isEditMode ? handleDeleteSavedTask : undefined}
        isCreatingTask={isCreatingTask}
        isDeletingTask={isDeletingTask}
        onClose={onClose}
        onSubmit={onSubmit}
        onDueDateChange={setCapaDueDate}
      />

      {isAddTaskOpen ? (
        <AddTaskModal
          sourceLabel={sourceLabel}
          sourceTitle={sourceTitle}
          capaCode={addTaskCapaCode}
          capaDueDate={capaDueDate}
          isSubmitting={isCreatingTask}
          onClose={() => setIsAddTaskOpen(false)}
          onSubmit={handleAddTask}
        />
      ) : null}
    </>
  );
}
