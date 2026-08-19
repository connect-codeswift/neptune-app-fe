"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import {
  CapaHierarchySelector,
  type ControlLevel,
} from "@/components/incidents/shared/capa/CapaHierarchySelector";
import {
  CapaDetailAddTaskModal,
  type CapaDetailAddTaskDraft,
} from "@/components/capa/detail/CapaDetailAddTaskModal";
import { CreateCapaHeader } from "@/components/capa/create/CreateCapaHeader";
import {
  buildCreateCapaSchema,
  CREATE_CAPA_FORM_ID,
  createCreateCapaInitialValues,
  fieldString,
} from "@/components/capa/create/create-capa-form-schema";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import {
  buildCapaTitleFromDescription,
  toApiControlLevel,
} from "@/services/mappers/capa.mapper";

/* The slate text ramp here is pinned (#1e293b, #334155, #475569, #64748b,
   #94a3b8): it is Tailwind's slate scale, not the brand greys, and rounding
   each to the nearest `--ehs-*` grey collapses five steps into three. The
   disabled submit fill #7bc1c5 is pinned for the same reason - it is opaque,
   not a translucent teal. */

const CAPA_ROUTE = "/dashboard/capa";

export type CreateCapaTaskDraft = Readonly<
  CapaDetailAddTaskDraft & {
    id: string;
  }
>;

function parseAssignedId(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.trunc(parsed);
}

function StepBadge(props: Readonly<{ step: string }>) {
  return (
    <span className="bg-ehs-normal-blue text-ehs-on-accent inline-flex size-6 shrink-0 items-center justify-center rounded-full pt-[2px] pb-[3px] text-sm leading-5">
      {props.step}
    </span>
  );
}

/** Create CAPA page — Figma 7123:41554. */
export function CreateCapaContent() {
  const router = useRouter();
  const createCapaMutation = useCreateCapaMutation();

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [tasks, setTasks] = useState<CreateCapaTaskDraft[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const schema = useMemo(() => buildCreateCapaSchema(), []);

  const initialValues = useMemo(
    () => createCreateCapaInitialValues(schema),
    [schema],
  );

  const description = fieldString(formValues ?? initialValues, "description");
  const isSubmitting = createCapaMutation.isPending;
  const canSubmit =
    controlLevel != null && description.trim().length > 0 && !isSubmitting;

  const handleCancel = () => {
    router.push(CAPA_ROUTE);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!controlLevel || isSubmitting) return;

    const auth = getAuthContext();
    if (!auth) {
      toast.error(
        "Could not create CAPA",
        "Sign in required to create a CAPA.",
      );
      return;
    }

    const description = fieldString(values, "description").trim();
    const capaType =
      fieldString(values, "type").trim().toLowerCase() === "preventive"
        ? "Preventive"
        : "Corrective";
    const priority = fieldString(values, "priority") || "Medium";
    const assigned = fieldString(values, "assigned");
    const dueDate = fieldString(values, "dueDate").trim();

    try {
      await createCapaMutation.mutateAsync({
        payload: {
          id: 0,
          title: buildCapaTitleFromDescription(description),
          capaType,
          priority,
          controlLevel: toApiControlLevel(controlLevel),
          description,
          userId: auth.userId,
          incidentId: 0,
          rcaId: 0,
          assignedId: parseAssignedId(assigned),
          dueDate,
          isDrop: false,
        },
        tasks: tasks.map((task) => ({
          task: task.name,
          owner: task.assigneeUserId || assigned,
          dueDate: task.dueDate,
          priority: task.priority,
        })),
      });

      const taskCount = tasks.length;
      toast.success(
        "CAPA created",
        taskCount > 0
          ? `${controlLevel} · ${capaType} with ${String(taskCount)} task${taskCount === 1 ? "" : "s"}`
          : `${controlLevel} · ${capaType}`,
      );
      router.push(CAPA_ROUTE);
    } catch (error) {
      toast.error(
        "Could not create CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const handleAddTask = (draft: CapaDetailAddTaskDraft) => {
    setTasks((current) => [
      ...current,
      {
        id: `task-${String(Date.now())}`,
        ...draft,
      },
    ]);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5 px-4 pb-8">
      <CreateCapaHeader />

      <IncidentGlassCard
        paddingClassName="p-0 overflow-hidden"
        className="min-w-0"
      >
        <div className="flex flex-col gap-8 px-4 pt-6 pb-6 sm:px-6 md:flex-row md:items-start md:gap-12 md:px-8 md:pt-8">
          <section className="w-full shrink-0 md:w-85 lg:w-98">
            <div className="mb-6 flex flex-col gap-1.25">
              <div className="flex items-center gap-2.5">
                <StepBadge step="1" />
                <Text as="h3" className="text-base leading-6 text-[#1e293b]">
                  Select control level
                </Text>
              </div>
              <Text as="p" className="text-sm leading-[19.5px] text-[#64748b]">
                Most → least effective. Prefer higher-order controls.
              </Text>
            </div>
            <CapaHierarchySelector
              value={controlLevel}
              onChange={setControlLevel}
            />
          </section>

          <section className="min-w-0 flex-1">
            <div className="mb-6 flex items-center gap-2.5">
              <StepBadge step="2" />
              <Text as="h3" className="text-base leading-6 text-[#1e293b]">
                What CAPA is needed?
              </Text>
            </div>

            <FormBuilder
              formId={CREATE_CAPA_FORM_ID}
              schema={schema}
              initialValues={initialValues}
              hideActions
              onChange={setFormValues}
              onSubmit={handleSubmit}
              beforeActions={
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Text
                      as="h4"
                      className="text-ehs-dark-bg text-base font-bold"
                    >
                      Tasks Checklist
                    </Text>
                    <button
                      type="button"
                      onClick={() => setAddTaskOpen(true)}
                      className="text-3.25 border-ehs-normal-blue/18 bg-ehs-normal-blue/12 text-ehs-normal-blue hover:bg-ehs-normal-blue/18 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 font-bold transition-colors"
                    >
                      <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
                      Add Task
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="rounded-2.5 border-ehs-border bg-ehs-surface/70 border border-dashed px-4 py-5 text-center text-sm text-[#94a3b8]">
                      No tasks yet. Add checklist items for the assignee.
                    </div>
                  ) : (
                    <ul className="rounded-2.5 border-ehs-border overflow-hidden border">
                      {tasks.map((task, index) => (
                        <li
                          key={task.id}
                          className={[
                            "bg-ehs-surface flex items-center justify-between gap-3 px-4 py-3",
                            index < tasks.length - 1
                              ? "border-ehs-border border-b"
                              : "",
                          ].join(" ")}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-3.25 leading-[19.5px] text-[#475569]">
                              {task.name}
                            </p>
                            {task.assigneeName ? (
                              <p className="mt-0.5 text-xs text-[#94a3b8]">
                                {task.assigneeName}
                                {task.dueDate ? ` · ${task.dueDate}` : ""}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-4">
                            <span className="bg-ehs-surface-inverse/14 text-ehs-gray rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase">
                              {task.priority}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${task.name}`}
                              onClick={() => removeTask(task.id)}
                              className="text-ehs-muted-text hover:text-ehs-red transition-colors"
                            >
                              <Icon
                                icon="mdi:trash-can-outline"
                                className="size-4"
                              />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              }
            />
          </section>
        </div>

        <div className="border-ehs-border flex flex-col gap-3 border-t px-4 py-5 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8">
          <p className="text-sm leading-[19.5px] text-[#94a3b8]">
            {controlLevel
              ? `${controlLevel} selected`
              : "Select a control level to continue"}
          </p>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-ehs-border rounded-xl border px-6 py-2.5 text-sm text-[#334155] max-md:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={CREATE_CAPA_FORM_ID}
              variant="primary"
              disabled={!canSubmit}
              className="rounded-xl px-5 py-2.5 text-sm disabled:bg-[#7bc1c5] disabled:opacity-100 max-md:flex-1"
            >
              <Icon icon="mdi:plus" className="size-4" aria-hidden />
              {isSubmitting ? "Adding…" : "Add CAPA"}
            </Button>
          </div>
        </div>
      </IncidentGlassCard>

      {addTaskOpen ? (
        <CapaDetailAddTaskModal
          confirmLabel="Add Task"
          onClose={() => setAddTaskOpen(false)}
          onAssign={handleAddTask}
        />
      ) : null}
    </div>
  );
}
