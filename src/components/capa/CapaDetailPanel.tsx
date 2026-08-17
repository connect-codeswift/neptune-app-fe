"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import {
  CAPA_LIFECYCLE_STAGES,
  type CapaDashboardItem,
  type CapaDashboardTask,
} from "@/components/capa/capa-dashboard-data";
import type { CapaTaskDto } from "@/dtos/res/capa-task-response.dto";
import { useCapaTasksQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { toast } from "@/lib/toast";

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized === "overdue") return "danger";
  if (normalized === "pending" || normalized === "verified") return "warn";
  if (
    normalized === "inprogress" ||
    normalized === "open"
  )
    return "teal";
  return "muted";
}

function parseCapaId(id: string): number | null {
  const parsed = Number.parseInt(id, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function mapTaskDtoToDashboardTask(task: CapaTaskDto): CapaDashboardTask {
  const label = task.task.trim();
  return {
    id: String(task.id),
    label: label.length > 0 ? label : "Untitled task",
    done: task.status === "Completed",
  };
}

export type CapaDetailPanelProps = Readonly<{
  item: CapaDashboardItem;
  /** Opens the full CAPA detail page (open-in-new control). */
  onOpenDetail?: () => void;
  className?: string;
}>;

/** Selected CAPA detail — Figma 7123:42184. */
export function CapaDetailPanel(props: Readonly<CapaDetailPanelProps>) {
  const { item, onOpenDetail, className = "" } = props;
  const hasToken = useHasAccessToken();
  const capaId = parseCapaId(item.id);

  const tasksQuery = useCapaTasksQuery({
    capaId,
    enabled: hasToken === true && capaId != null,
  });
  const tasks = useMemo(
    () => (tasksQuery.data ?? []).map(mapTaskDtoToDashboardTask),
    [tasksQuery.data],
  );
  const doneCount = tasks.filter((task) => task.done).length;
  const isTasksLoading =
    hasToken === true &&
    capaId != null &&
    (tasksQuery.isLoading || (tasksQuery.isFetching && !tasksQuery.data));

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-4.5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Text as="span" className="text7 text-ehs-muted-text">
              {item.code}
            </Text>
            <IncidentBadge
              label={item.type}
              tone={item.type === "Corrective" ? "teal" : "muted"}
              className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
            />
            <IncidentBadge
              label={item.status}
              tone={statusTone(item.status)}
              showDot
              className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
            />
          </div>
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-darker inline-flex size-6 items-center justify-center rounded-md"
            aria-label="More actions"
            onClick={() => toast.info("More actions coming soon")}
          >
            <Icon icon="mdi:dots-horizontal" className="size-4" aria-hidden />
          </button>
        </div>
        <Text as="h2" className="text3 text-ehs-darker mt-2">
          {item.title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-1">
          {item.source}
        </Text>
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Text as="span" className="text8 text-ehs-muted-text">
            Progress
          </Text>
          <Text as="span" className="text7 text-ehs-darker">
            {`${String(item.progress)}%`}
          </Text>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(11,19,32,0.08)]">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(item.progress)}%` }}
          />
        </div>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-3.5 border-b px-5 py-4">
        <MetaField label="Assigned To" value={item.owner} />
        <MetaField label="Due" value={item.dueDate} />
        <MetaField label="Priority" value={item.priority} />
        <MetaField label="Days left" value={item.dueLabel} />
      </div>

      <div className="border-ehs-border border-b px-5 py-4">
        <Text as="p" className="text9 text-ehs-muted-text mb-3">
          Lifecycle
        </Text>
        <div className="flex items-start justify-between gap-1">
          {CAPA_LIFECYCLE_STAGES.map((stage, index) => {
            const complete = index < item.lifecycleStep;
            const current = index === item.lifecycleStep;

            return (
              <div
                key={stage}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <span
                  className={[
                    "text7 flex size-6.5 items-center justify-center rounded-full",
                    complete
                      ? "bg-ehs-normal-blue text-white"
                      : current
                        ? "border-ehs-normal-blue text-ehs-normal-blue border bg-white"
                        : "border-ehs-border text-ehs-muted-text border bg-white",
                  ].join(" ")}
                >
                  {complete ? (
                    <Icon icon="mdi:check" className="size-3" aria-hidden />
                  ) : (
                    String(index + 1)
                  )}
                </span>
                <Text as="span" className="text8 text-ehs-muted-text text-center">
                  {stage}
                </Text>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-ehs-border border-b px-5 py-4">
        <Text as="p" className="text9 text-ehs-muted-text mb-2.5">
          {isTasksLoading
            ? "Tasks"
            : `Tasks · ${String(doneCount)} of ${String(tasks.length)} done`}
        </Text>
        {isTasksLoading ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            Loading tasks…
          </Text>
        ) : null}
        {!isTasksLoading && tasksQuery.isError ? (
          <Text as="p" className="text4 text-ehs-red">
            Could not load tasks.
          </Text>
        ) : null}
        {!isTasksLoading && !tasksQuery.isError && tasks.length === 0 ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            No tasks yet.
          </Text>
        ) : null}
        {!isTasksLoading && !tasksQuery.isError && tasks.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="border-ehs-border/60 flex items-start gap-2.5 border-b py-2 last:border-b-0"
              >
                <span
                  className={[
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
                    task.done
                      ? "bg-ehs-normal-blue text-white"
                      : "border-ehs-border border",
                  ].join(" ")}
                  aria-hidden
                >
                  {task.done ? (
                    <Icon icon="mdi:check" className="size-2.5" />
                  ) : null}
                </span>
                <Text
                  as="span"
                  className={[
                    "text4 leading-snug",
                    task.done
                      ? "text-ehs-muted-text line-through"
                      : "text-ehs-darker",
                  ].join(" ")}
                >
                  {task.label}
                </Text>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-ehs-border flex items-center gap-2 border-t px-5 pt-3.5 pb-3">
        <Button
          type="button"
          variant="primary"
          className="text5 min-w-0 flex-1 gap-2 rounded-2.5 px-4 py-2.5"
          onClick={() => toast.info("Update progress coming soon")}
        >
          <Icon icon="mdi:check" className="size-3.5 shrink-0" aria-hidden />
          Update progress
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="shrink-0 rounded-2.5 p-0"
          aria-label="Collaborators"
          onClick={() => toast.info("Collaborators coming soon")}
        >
          <Icon
            icon="mdi:account-multiple-outline"
            className="size-5"
            aria-hidden
          />
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="shrink-0 rounded-2.5 p-0"
          aria-label="Open CAPA detail"
          onClick={() => {
            if (onOpenDetail) {
              onOpenDetail();
              return;
            }
            toast.info("Open CAPA coming soon");
          }}
        >
          <Icon icon="mdi:open-in-new" className="size-5" aria-hidden />
        </Button>
      </div>
    </IncidentGlassCard>
  );
}

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker truncate capitalize">
        {value || "—"}
      </Text>
    </div>
  );
}
