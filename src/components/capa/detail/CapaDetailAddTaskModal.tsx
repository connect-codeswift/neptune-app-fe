"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import {
  buildCapaAddTaskSchema,
  CAPA_ADD_TASK_FORM_ID,
  createCapaAddTaskInitialValues,
  fieldString,
  type CapaAddTaskInitialDraft,
} from "@/components/capa/detail/capa-add-task-schema";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Text } from "@/components/Text";

export type CapaDetailAddTaskDraft = Readonly<{
  name: string;
  dueDate: string;
  priority: string;
}>;

export type CapaDetailAddTaskModalProps = Readonly<{
  onClose: () => void;
  isSubmitting?: boolean;
  /** Primary button label. Defaults to "Assign Task". */
  confirmLabel?: string;
  title?: string;
  initialDraft?: CapaAddTaskInitialDraft;
  /** ISO `yyyy-mm-dd`. Caps the task picker so a task cannot outlive its CAPA. */
  capaDueDate?: string;
  onAssign?: (task: CapaDetailAddTaskDraft) => void | Promise<void>;
}>;

/** Add New Task modal — Figma 5491:23536. Mount only while open for fresh form state. */
export function CapaDetailAddTaskModal(
  props: Readonly<CapaDetailAddTaskModalProps>,
) {
  const {
    onClose,
    onAssign,
    isSubmitting = false,
    confirmLabel = "Assign Task",
    title = "Add New Task",
    initialDraft,
    capaDueDate,
  } = props;
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const busy = isSubmitting || isLocalSubmitting;

  const schema = useMemo(
    () => buildCapaAddTaskSchema(capaDueDate),
    [capaDueDate],
  );
  const [initialValues] = useState(() =>
    createCapaAddTaskInitialValues(schema, initialDraft),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  const handleSubmit = async (values: FormValues) => {
    if (busy) return;

    setIsLocalSubmitting(true);
    try {
      await onAssign?.({
        name: fieldString(values, "name").trim(),
        dueDate: fieldString(values, "dueDate"),
        priority: fieldString(values, "priority") || "Medium",
      });
      onClose();
    } catch {
      // Parent shows toast; keep modal open for retry.
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="backdrop-blur-0.5 bg-ehs-surface-inverse/45 fixed inset-0 z-110 flex items-center justify-center p-4"
      onClick={() => {
        if (!busy) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capa-detail-add-task-title"
        onClick={(event) => event.stopPropagation()}
        className="bg-ehs-surface flex w-full max-w-140 flex-col overflow-hidden rounded-2xl shadow-(--ehs-shadow-modal)"
      >
        <header className="border-ehs-border-ink/8 flex items-center justify-between border-b px-6 pt-5 pb-4">
          <Text
            as="h2"
            id="capa-detail-add-task-title"
            className="text-ehs-dark-bg text-lg leading-normal font-semibold"
          >
            {title}
          </Text>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
            className="text-ehs-gray hover:text-ehs-dark-bg inline-flex size-5 shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon="mdi:close" className="size-6" aria-hidden />
          </button>
        </header>

        <div className="p-6">
          <FormBuilder
            formId={CAPA_ADD_TASK_FORM_ID}
            schema={schema}
            initialValues={initialValues}
            hideActions
            onSubmit={(values) => {
              void handleSubmit(values);
            }}
          />
        </div>

        <footer className="border-ehs-border-ink/8 flex items-center justify-end gap-3 border-t px-6 pt-4 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-2.5 border-ehs-border hover:bg-ehs-surface-raised text-ehs-slate cursor-pointer border px-5 py-2.5 text-sm leading-normal font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={CAPA_ADD_TASK_FORM_ID}
            disabled={busy}
            className="rounded-2.5 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-on-accent cursor-pointer px-5 py-2.5 text-sm leading-normal font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Saving…" : confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
