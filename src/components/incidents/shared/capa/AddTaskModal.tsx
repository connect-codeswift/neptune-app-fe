"use client";

import { useId, useState } from "react";
import { Icon } from "@iconify/react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import { CapaModalFieldLabel } from "@/components/incidents/shared/capa/CapaModalFieldLabel";
import {
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";
import { ReportPersonSearchField } from "@/components/incidents/report/shared/ReportPersonSearchField";
import { useCurrentSite } from "@/hooks/use-current-site";

export type CapaTaskFormPayload = Readonly<{
  task: string;
  owner: string;
  dueDate: string;
}>;

export type AddTaskModalProps = Readonly<{
  incidentId: string;
  incidentTitle: string;
  capaCode: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit?: (payload: CapaTaskFormPayload) => void | Promise<void>;
}>;

export function AddTaskModal(props: Readonly<AddTaskModalProps>) {
  const {
    incidentId,
    incidentTitle,
    capaCode,
    isSubmitting = false,
    onClose,
    onSubmit,
  } = props;

  const taskFieldId = useId();
  const site = useCurrentSite();

  const [task, setTask] = useState("");
  const [owner, setOwner] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
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
        owner: ownerUserId.trim() || owner.trim(),
        dueDate,
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
      subtitle={`${incidentId} · ${incidentTitle} · ${capaCode}`}
      onClose={onClose}
      maxWidthClassName="max-w-[560px]"
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
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-4">
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
              linked CAPA card.
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
              className="text-ehs-dark-bg placeholder:text-ehs-muted-text focus:ring-ehs-normal-blue/25 h-[108px] w-full resize-none rounded-xl bg-white px-3.5 pt-3 pb-10 text-sm leading-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2"
            />
            <AiTextAssistant value={task} onApply={setTask} />
          </div>
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
            placeholder="Start typing a name…"
          />

          <ReportDateField
            variant="embedded"
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
            placeholder="MM/DD/YYYY"
          />
        </div>
      </div>
    </IncidentModalShell>
  );
}
