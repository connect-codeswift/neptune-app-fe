"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import {
  buildCapaAddTaskSchema,
  CAPA_ADD_TASK_FORM_ID,
  createCapaAddTaskInitialValues,
  fieldString,
} from "@/components/capa/detail/capa-add-task-schema";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { useCurrentSite } from "@/hooks/use-current-site";

export type CapaDetailAddTaskDraft = Readonly<{
  name: string;
  description: string;
  assigneeName: string;
  assigneeUserId: string;
  dueDate: string;
  priority: string;
}>;

export type CapaDetailAddTaskModalProps = Readonly<{
  onClose: () => void;
  onAssign?: (task: CapaDetailAddTaskDraft) => void;
}>;

/** Add New Task modal — Figma 5491:23536. Mount only while open for fresh form state. */
export function CapaDetailAddTaskModal(
  props: Readonly<CapaDetailAddTaskModalProps>,
) {
  const { onClose, onAssign } = props;
  const site = useCurrentSite();

  const schema = useMemo(
    () =>
      buildCapaAddTaskSchema({
        siteId: site.id,
        siteName: site.name,
      }),
    [site.id, site.name],
  );

  const initialValues = useMemo(
    () => createCapaAddTaskInitialValues(schema),
    [schema],
  );

  useEffect(() => {
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

  const handleSubmit = (values: FormValues) => {
    onAssign?.({
      name: fieldString(values, "name").trim(),
      description: fieldString(values, "description").trim(),
      assigneeName: fieldString(values, "assignedName").trim(),
      assigneeUserId: fieldString(values, "assigned").trim(),
      dueDate: fieldString(values, "dueDate"),
      priority: fieldString(values, "priority") || "Medium",
    });
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(11,19,32,0.45)] p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capa-detail-add-task-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        <header className="flex items-center justify-between border-b border-[rgba(15,23,42,0.08)] px-6 pt-5 pb-4">
          <Text
            as="h2"
            id="capa-detail-add-task-title"
            className="text-lg leading-normal font-semibold text-[#0b1320]"
          >
            Add New Task
          </Text>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center text-[#566072] transition-colors hover:text-[#0b1320]"
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
            onSubmit={handleSubmit}
          />
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[rgba(15,23,42,0.08)] px-6 pt-4 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[10px] border border-[#cbd5e1] px-5 py-2.5 text-sm leading-normal font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={CAPA_ADD_TASK_FORM_ID}
            className="cursor-pointer rounded-[10px] bg-[#0891a6] px-5 py-2.5 text-sm leading-normal font-semibold text-white transition-colors hover:bg-[#078395]"
          >
            Assign Task
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
