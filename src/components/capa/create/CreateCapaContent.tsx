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
  CreateCapaAddTaskModal,
  type CreateCapaTaskDraft,
} from "@/components/capa/create/CreateCapaAddTaskModal";
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
import { useCurrentSite } from "@/hooks/use-current-site";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import {
  buildCapaTitleFromDescription,
  toApiControlLevel,
} from "@/services/mappers/capa.mapper";

const CAPA_ROUTE = "/dashboard/capa";

function parseAssignedId(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.trunc(parsed);
}

function StepBadge(props: Readonly<{ step: string }>) {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0891a6] pt-[1.5px] pb-[2.5px] text-sm leading-5 text-white">
      {props.step}
    </span>
  );
}

/** Create CAPA page — Figma 7123:41554. */
export function CreateCapaContent() {
  const router = useRouter();
  const site = useCurrentSite();
  const createCapaMutation = useCreateCapaMutation();

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [tasks, setTasks] = useState<CreateCapaTaskDraft[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const schema = useMemo(
    () =>
      buildCreateCapaSchema({
        siteId: site.id,
        siteName: site.name,
      }),
    [site.id, site.name],
  );

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
          owner: assigned,
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

  return (
    <div className="flex min-w-0 flex-col gap-3.5 px-4 pb-8">
      <CreateCapaHeader />

      <IncidentGlassCard
        paddingClassName="p-0 overflow-hidden"
        className="min-w-0"
      >
        <div className="flex flex-col gap-8 px-6 pt-8 pb-6 md:flex-row md:items-start md:gap-12 md:px-8 md:pt-8">
          <section className="w-full shrink-0 md:w-[340px] lg:w-[392px]">
            <div className="mb-6 flex flex-col gap-[5px]">
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
              key={String(site.id)}
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
                      className="text-base font-bold text-[#0b1320]"
                    >
                      Tasks Checklist
                    </Text>
                    <button
                      type="button"
                      onClick={() => setAddTaskOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[rgba(8,145,166,0.18)] bg-[rgba(8,145,166,0.12)] px-3 py-2 text-[13px] font-bold text-[#0891a6] transition-colors hover:bg-[rgba(8,145,166,0.18)]"
                    >
                      <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
                      Add Task
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="rounded-[10px] border border-dashed border-[#e2e8f0] bg-white/70 px-4 py-5 text-center text-sm text-[#94a3b8]">
                      No tasks yet. Add checklist items for the assignee.
                    </div>
                  ) : (
                    <ul className="overflow-hidden rounded-[10px] border border-[#e2e8f0]">
                      {tasks.map((task, index) => (
                        <li
                          key={task.id}
                          className={[
                            "flex items-center justify-between gap-3 bg-white px-4 py-3",
                            index < tasks.length - 1
                              ? "border-b border-[#e2e8f0]"
                              : "",
                          ].join(" ")}
                        >
                          <p className="min-w-0 flex-1 text-[13px] leading-[19.5px] text-[#475569]">
                            {task.name}
                          </p>
                          <div className="flex shrink-0 items-center gap-4">
                            <span className="rounded-full bg-[rgba(11,19,32,0.14)] px-2.5 py-1 text-xs font-bold tracking-wide text-[#566072] uppercase">
                              {task.priority}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${task.name}`}
                              onClick={() => removeTask(task.id)}
                              className="text-[#8892a3] transition-colors hover:text-[#ef4444]"
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cfd6d9] px-6 py-5 md:px-8">
          <p className="text-sm leading-[19.5px] text-[#94a3b8]">
            {controlLevel
              ? `${controlLevel} selected`
              : "Select a control level to continue"}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-[#cbd5e1] px-6 py-2.5 text-sm text-[#334155]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={CREATE_CAPA_FORM_ID}
              variant="primary"
              disabled={!canSubmit}
              className="rounded-xl px-5 py-2.5 text-sm disabled:bg-[#7bc1c5] disabled:opacity-100"
            >
              <Icon icon="mdi:plus" className="size-4" aria-hidden />
              {isSubmitting ? "Adding…" : "Add CAPA"}
            </Button>
          </div>
        </div>
      </IncidentGlassCard>

      {addTaskOpen ? (
        <CreateCapaAddTaskModal
          onClose={() => setAddTaskOpen(false)}
          onAdd={(task) => setTasks((current) => [...current, task])}
        />
      ) : null}
    </div>
  );
}
