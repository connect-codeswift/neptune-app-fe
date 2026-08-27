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
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
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
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaTaskFormPayload) => void | Promise<void>;
}>;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

export function AddTaskModal(props: Readonly<AddTaskModalProps>) {
  const {
    sourceLabel,
    sourceTitle,
    capaCode,
    isSubmitting = false,
    onClose,
    onSubmit,
  } = props;

  const taskFieldId = useId();

  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(PRIORITY_OPTIONS[1]);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const busy = isSubmitting || isLocalSubmitting;
  const canSubmit = task.trim().length > 0 && !busy;

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
      title="Add Task"
      subtitle={`${sourceLabel} · ${sourceTitle} · ${capaCode}`}
      onClose={onClose}
      maxWidthClassName="max-w-140"
      overlayClassName="z-[110]"
      footerHint="Assign a clear action the assignee can complete and track."
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} />
          <IncidentModalPrimaryButton
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            label={busy ? "Adding…" : "Add Task"}
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
          <ReportDateField
            variant="embedded"
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
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
