"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { CapaModalFieldLabel } from "@/components/incidents/shared/capa/CapaModalFieldLabel";
import { CapaSegmentedToggle } from "@/components/incidents/shared/capa/CapaSegmentedToggle";
import { ReportDateField } from "@/components/incidents/report/shared/ReportDateField";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;

export type CreateCapaTaskDraft = Readonly<{
  id: string;
  name: string;
  dueDate: string;
  priority: string;
}>;

export type CreateCapaAddTaskModalProps = Readonly<{
  onClose: () => void;
  onAdd: (task: CreateCapaTaskDraft) => void;
}>;

/** Add Task modal — Figma 7123:41708. */
export function CreateCapaAddTaskModal(props: CreateCapaAddTaskModalProps) {
  const { onClose, onAdd } = props;
  const nameId = useId();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>(PRIORITY_OPTIONS[1]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const canSubmit = name.trim().length > 0;

  const handleAdd = () => {
    if (!canSubmit) return;

    onAdd({
      id: `task-${String(Date.now())}`,
      name: name.trim(),
      dueDate,
      priority,
    });
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(11,19,32,0.45)] p-4 backdrop-blur-0.5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-capa-add-task-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-105 flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between gap-3">
          <Text
            as="h2"
            id="create-capa-add-task-title"
            className="text-[#0b1320] text-lg font-bold"
          >
            Add Task
          </Text>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ehs-muted-text hover:text-ehs-darker inline-flex size-6 items-center justify-center rounded-full"
          >
            <Icon icon="mdi:close-circle-outline" className="size-3.5" />
          </button>
        </div>

        <div className="h-px w-full bg-[rgba(15,23,42,0.08)]" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <CapaModalFieldLabel htmlFor={nameId} required>
              Task Name
            </CapaModalFieldLabel>
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Describe the task action..."
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.75 text-sm text-[#0b1320] outline-none placeholder:text-[#94a3b8] focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
            />
          </div>

          <ReportDateField
            variant="embedded"
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
            placeholder="mm/dd/yyyy"
          />

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

        <div className="h-px w-full bg-[rgba(15,23,42,0.08)]" />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#334155]"
          >
            Cancel
          </button>
          <Button
            type="button"
            variant="primary"
            disabled={!canSubmit}
            onClick={handleAdd}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
