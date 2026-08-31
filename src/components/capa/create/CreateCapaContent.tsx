"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { type ControlLevel } from "@/components/incidents/shared/capa/CapaHierarchySelector";
import {
  AddTaskModal,
  type CapaTaskFormPayload,
} from "@/components/incidents/shared/capa/AddTaskModal";
import { CapaModalTasksSection } from "@/components/incidents/shared/capa/CapaModalTasksSection";
import type { StagedCapaTask } from "@/components/incidents/shared/capa/AddCapaModal";
import {
  CapaControlLevelStep,
  CapaCoreFields,
  CapaStepHeading,
  CAPA_PRIORITY_OPTIONS,
  CAPA_TYPE_OPTIONS,
  resolveCapaFooterHint,
  type CapaCoreFieldsValue,
} from "@/components/capa/shared/CapaFormSteps";
import { CreateCapaHeader } from "@/components/capa/create/CreateCapaHeader";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { cantBePast, mmDdYyyyToIso } from "@/lib/date-time-field";
import { toast } from "@/lib/toast";
import { buildCreateCapaRequest } from "@/services/mappers/capa.mapper";

/* The disabled submit fill #7bc1c5 is pinned: it is an opaque teal, not a
   translucent one, so no `--ehs-*` token plus an alpha reproduces it. */

const CAPA_ROUTE = "/dashboard/capa";

/**
 * Create CAPA — Figma 7123:41554.
 *
 * The form itself is `CapaControlLevelStep` + `CapaCoreFields`, shared with the
 * Add CAPA modal raised from an incident, hazard or near miss; this route only
 * frames them and owns the mutation. It used to be a second, FormBuilder-driven
 * build of the same fields, which drifted from the modal on every change.
 */
export function CreateCapaContent() {
  const router = useRouter();

  // ?sourceType=Hazard&sourceId=12 - set by the "Add CAPA" link on a hazard or near miss.
  // Absent on the plain New CAPA route, which is how a standalone CAPA is raised.
  const searchParams = useSearchParams();
  const sourceType = searchParams.get("sourceType")?.trim() ?? "";
  const sourceId = Number(searchParams.get("sourceId") ?? 0);
  const createCapaMutation = useCreateCapaMutation();
  // Held past the response: `isPending` drops when the record is created,
  // while the push to the next page is still in flight. A click in that gap
  // saved a duplicate.
  const submitLock = useSubmitLock();

  const [controlLevel, setControlLevel] = useState<ControlLevel | null>(null);
  const [fields, setFields] = useState<CapaCoreFieldsValue>({
    description: "",
    type: CAPA_TYPE_OPTIONS[0],
    owner: "",
    ownerUserId: "",
    dueDate: "",
    priority: CAPA_PRIORITY_OPTIONS[1],
  });
  const [tasks, setTasks] = useState<readonly StagedCapaTask[]>([]);
  const [editingTaskLocalId, setEditingTaskLocalId] = useState<string | null>(
    null,
  );
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const isSubmitting = submitLock.isLocked;
  const dueDateError = cantBePast(
    mmDdYyyyToIso(fields.dueDate),
    "Due date",
  ).error;

  // A CAPA with no tasks is a dead end: status is derived from its tasks, so it can never
  // leave Open - not Completed, so never Pending Verification, and never Closed. The only
  // thing anyone could do with it afterwards is drop it. Require one up front instead.
  const hasAtLeastOneTask = tasks.length > 0;
  const canSubmit =
    controlLevel != null &&
    fields.description.trim().length > 0 &&
    hasAtLeastOneTask &&
    dueDateError === null &&
    !isSubmitting;

  const patchFields = (patch: Partial<CapaCoreFieldsValue>) => {
    setFields((current) => ({ ...current, ...patch }));
  };

  const handleCancel = () => {
    router.push(CAPA_ROUTE);
  };

  const handleSubmit = async () => {
    if (!controlLevel || !canSubmit || !submitLock.acquire()) {
      return;
    }

    try {
      await createCapaMutation.mutateAsync({
        payload: buildCreateCapaRequest({
          // Carried from ?sourceType=&sourceId= so a CAPA raised from a hazard or a near
          // miss links back to it. Without these it saves as Standalone, and the record it
          // came from shows no CAPA at all.
          ...(sourceType && sourceId > 0 ? { sourceType, sourceId } : {}),
          controlLevel,
          description: fields.description.trim(),
          type: fields.type,
          owner: fields.ownerUserId.trim() || fields.owner.trim(),
          dueDate: fields.dueDate,
          priority: fields.priority,
        }),
        tasks: tasks.map((task) => ({
          task: task.task,
          dueDate: task.dueDate,
          priority: task.priority,
        })),
      });

      const taskCount = tasks.length;
      toast.success(
        "CAPA created",
        `${controlLevel} · ${fields.type} with ${String(taskCount)} task${taskCount === 1 ? "" : "s"}`,
      );
      router.push(CAPA_ROUTE);
    } catch (error) {
      submitLock.release();
      toast.error(
        "Could not create CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  const closeTaskModal = () => {
    setAddTaskOpen(false);
    setEditingTaskLocalId(null);
  };

  const handleAddTask = (payload: CapaTaskFormPayload) => {
    if (editingTaskLocalId !== null) {
      setTasks((current) =>
        current.map((task) =>
          task.localId === editingTaskLocalId
            ? { ...payload, localId: task.localId }
            : task,
        ),
      );
      return;
    }

    setTasks((current) => [
      ...current,
      { ...payload, localId: crypto.randomUUID() },
    ]);
  };

  const openAddTask = () => {
    // A task's picker is capped against the CAPA's own due date, so opening this
    // before one is chosen would let a task be dated past its parent.
    if (fields.dueDate.trim().length === 0) {
      toast.error(
        "Set the CAPA due date first",
        "Tasks are scheduled against it, so it has to be chosen before adding one.",
      );
      return;
    }
    setAddTaskOpen(true);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5 px-4 pb-8">
      <CreateCapaHeader />

      <IncidentGlassCard
        paddingClassName="p-0 overflow-hidden"
        className="min-w-0"
      >
        <div className="grid grid-cols-1 gap-8 px-4 pt-6 pb-6 sm:px-6 md:grid-cols-2 md:items-start md:gap-x-12 md:px-8 md:pt-8">
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

          {/* Its own row: the checklist is a list, and a list reads badly in a
              half-width column beside the triangle. */}
          <section className="min-w-0 md:col-span-2">
            <CapaModalTasksSection
              heading={<CapaStepHeading step="3" title="Tasks Checklist" />}
              isEditMode={false}
              savedTasks={[]}
              stagedTasks={tasks}
              busy={isSubmitting}
              onOpenAddTask={openAddTask}
              onRemoveStagedTask={(localId) => {
                setTasks((current) =>
                  current.filter((task) => task.localId !== localId),
                );
              }}
              onEditStagedTask={(localId) => {
                setEditingTaskLocalId(localId);
                setAddTaskOpen(true);
              }}
            />
          </section>
        </div>

        <div className="border-ehs-border flex flex-col gap-3 border-t px-4 py-5 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8">
          <p className="text-ehs-muted-text text-sm leading-[19.5px]">
            {resolveCapaFooterHint({
              controlLevel,
              description: fields.description,
              hasAtLeastOneTask,
            })}
          </p>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-ehs-border text-ehs-slate rounded-xl border px-6 py-2.5 text-sm max-md:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                void handleSubmit();
              }}
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
        <AddTaskModal
          sourceLabel={sourceType || "Standalone"}
          sourceTitle="New CAPA"
          capaCode="new CAPA"
          capaDueDate={fields.dueDate}
          initialValues={
            tasks.find((task) => task.localId === editingTaskLocalId) ??
            undefined
          }
          onClose={closeTaskModal}
          onSubmit={handleAddTask}
        />
      ) : null}
    </div>
  );
}
