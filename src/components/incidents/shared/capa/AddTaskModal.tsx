"use client";

import { useId, useState } from "react";
import { Icon } from "@iconify/react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import { CapaModalFieldLabel } from "./CapaModalFieldLabel";
import { CapaSegmentedToggle } from "@/components/incidents/shared/capa/CapaSegmentedToggle";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import { DateInput } from "@/components/inputs/DateInput";
import {
  cantBePast,
  mmDdYyyyToIso,
  todayMmDdYyyy,
} from "@/lib/date-time-field";
import { FIELD_TEXTAREA_WITH_CONTROLS_CLASS } from "@/components/ui/field-styles";

export type CapaTaskFormPayload = Readonly<{
  task: string;
  dueDate: string;
  priority?: string;
}>;

export type AddTaskModalProps = Readonly<{
  sourceLabel: string;
  sourceTitle: string;
  capaCode: string;
  /** The CAPA's own due date. A task cannot fall due after the action that contains it. */
  capaDueDate?: string;
  isSubmitting?: boolean;
  /**
   * Present when an already-staged task is being corrected rather than a new one added.
   * The modal is mounted only while open, so these seed the fields once on mount and no
   * effect is needed to keep them in step.
   */
  initialValues?: CapaTaskFormPayload;
  onClose: () => void;
  onSubmit?: (payload: CapaTaskFormPayload) => void | Promise<void>;
}>;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

/** MM/DD/YYYY -> a comparable number, or null when it is not a whole date yet. */
function toComparableDate(value: string): number | null {
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!parts) {
    return null;
  }
  return Number(`${parts[3]}${parts[1]}${parts[2]}`);
}

/** True when a task is dated before today — the API rejects it, as does the
 * schema-driven Add Task form. */
function isDueDateInPast(taskDue: string): boolean {
  return cantBePast(mmDdYyyyToIso(taskDue)).error !== null;
}

/** True when a task would fall due after the CAPA that contains it. */
function exceedsCapaDueDate(taskDue: string, capaDue?: string): boolean {
  const task = toComparableDate(taskDue);
  const capa = capaDue ? toComparableDate(capaDue) : null;
  return task != null && capa != null && task > capa;
}

export function AddTaskModal(props: Readonly<AddTaskModalProps>) {
  const {
    sourceLabel,
    sourceTitle,
    capaCode,
    capaDueDate,
    isSubmitting = false,
    initialValues,
    onClose,
    onSubmit,
  } = props;

  const taskFieldId = useId();

  const isEditingTask = initialValues != null;
  const [task, setTask] = useState(initialValues?.task ?? "");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [priority, setPriority] = useState<string>(
    initialValues?.priority ?? PRIORITY_OPTIONS[1],
  );
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const busy = isSubmitting || isLocalSubmitting;
  // maxDate greys the day out in the calendar but the field also accepts typed input, so the
  // rule is checked here as well — otherwise a task could be dated past the CAPA by typing it.
  const isDueDateTooLate = exceedsCapaDueDate(dueDate, capaDueDate);
  const isDueDateTooEarly = isDueDateInPast(dueDate);
  // The due date is required, not merely range-checked. Without this a task saved with an
  // empty date passed both rules above, and the create mutation then filtered it out for
  // having no date — so the CAPA was created with no tasks at all, which it can never
  // recover from because its status is derived from them.
  const canSubmit =
    task.trim().length > 0 &&
    dueDate.trim().length > 0 &&
    !isDueDateTooLate &&
    !isDueDateTooEarly &&
    !busy;

  // A lookup rather than a ternary chain: two independent date rules share the
  // one hint slot (no-nested-ternaries).
  function resolveDueDateHint(): string {
    if (isDueDateTooLate) {
      return `A task cannot be due after the CAPA (${capaDueDate ?? ""}).`;
    }
    if (isDueDateTooEarly) {
      return "A task cannot be due in the past.";
    }
    return "Assign a clear action the assignee can complete and track.";
  }

  const dueDateHint = resolveDueDateHint();

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsLocalSubmitting(true);
    try {
      await onSubmit?.({
        task: task.trim(),
        dueDate,
        priority,
      });
      onClose();
    } catch {
      // Parent shows toast; keep modal open for retry.
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  return (
    <IncidentModalShell
      title={isEditingTask ? "Edit Task" : "Add Task"}
      subtitle={`${sourceLabel} · ${sourceTitle} · ${capaCode}`}
      onClose={onClose}
      maxWidthClassName="max-w-140"
      overlayClassName="z-[110]"
      footerHint={dueDateHint}
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
                ? isEditingTask
                  ? "Saving…"
                  : "Adding…"
                : isEditingTask
                  ? "Save Task"
                  : "Add Task"
            }
          />
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <div className="border-ehs-border-ink/8 bg-ehs-surface/70 flex items-start gap-3 rounded-xl border p-4">
          <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon
              icon="mdi:clipboard-check-outline"
              className="size-5"
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0 flex-1">
            <Text
              as="p"
              className="text-ehs-dark-bg text-sm leading-[19.5px] font-medium"
            >
              {`New action for ${capaCode}`}
            </Text>
            <Text
              as="p"
              className="text-ehs-muted-text mt-0.5 text-sm leading-[19.5px]"
            >
              Tasks appear on the assignee&apos;s list and drive progress on the
              linked CAPA card. The task owner is set automatically to the
              CAPA&apos;s assignee.
            </Text>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <CapaModalFieldLabel htmlFor={taskFieldId} required>
            Task description
          </CapaModalFieldLabel>
          <div className="relative">
            <textarea
              id={taskFieldId}
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Describe what the assignee needs to do…"
              rows={4}
              className={FIELD_TEXTAREA_WITH_CONTROLS_CLASS}
            />
            <AiTextAssistant module="incident" value={task} onApply={setTask} />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1">
          <DateInput
            variant="embedded"
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
            minDate={todayMmDdYyyy()}
            maxDate={capaDueDate}
            placeholder="MM/DD/YYYY"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <CapaModalFieldLabel>Priority</CapaModalFieldLabel>
          <CapaSegmentedToggle
            ariaLabel="Task priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        </div>
      </div>
    </IncidentModalShell>
  );
}
