"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
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
import { capaStatusPillClass } from "@/lib/capa-filters";
import { toast } from "@/lib/toast";

const TYPE_PILL: Record<CapaDashboardItem["type"], string> = {
  Corrective: "bg-[#0891a6] text-white",
  Preventive: "bg-[rgba(15,23,42,0.06)] text-[#566072]",
};

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
}>;

/** Selected CAPA detail — Figma 7123:42184. */
export function CapaDetailPanel(props: CapaDetailPanelProps) {
  const { item, onOpenDetail } = props;
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
      className="min-w-0"
    >
      <div className="border-b border-[rgba(15,23,42,0.08)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-ehs-muted-text text-sm font-semibold">
              {item.code}
            </span>
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold",
                TYPE_PILL[item.type],
              ].join(" ")}
            >
              {item.type}
            </span>
            <span
              className={[
                "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold",
                capaStatusPillClass(item.status),
              ].join(" ")}
            >
              {item.status}
            </span>
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
        <Text
          as="h3"
          className="text-ehs-darker mt-2 text-base leading-snug font-bold"
        >
          {item.title}
        </Text>
        <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
          {item.source}
        </Text>
      </div>

      <div className="border-b border-[rgba(15,23,42,0.08)] px-5 py-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-ehs-muted-text text-sm">Progress</span>
          <span className="text-ehs-darker text-xs font-semibold tabular-nums">
            {`${String(item.progress)}%`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
          <div
            className="h-full rounded-full bg-[#0891a6]"
            style={{ width: `${String(item.progress)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-b border-[rgba(15,23,42,0.08)] px-5 py-4">
        <MetaField label="Owner" value={item.owner} />
        <MetaField label="Due" value={item.dueDate} />
        <MetaField label="Priority" value={item.priority} />
        <MetaField label="Days left" value={item.dueLabel} />
      </div>

      <div className="border-b border-[rgba(15,23,42,0.08)] px-5 py-4">
        <Text as="p" className="text-ehs-muted-text mb-3 text-sm">
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
                    "flex size-6.5 items-center justify-center rounded-full text-sm font-bold",
                    complete
                      ? "bg-[#0891a6] text-white"
                      : current
                        ? "border border-[#0891a6] bg-white text-[#0891a6]"
                        : "border border-[rgba(15,23,42,0.12)] bg-white text-[#8892a3]",
                  ].join(" ")}
                >
                  {complete ? (
                    <Icon icon="mdi:check" className="size-3" aria-hidden />
                  ) : (
                    String(index + 1)
                  )}
                </span>
                <span className="text-ehs-muted-text text-center text-xs leading-tight">
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-b border-[rgba(15,23,42,0.08)] px-5 py-4">
        <Text as="p" className="text-ehs-muted-text mb-2.5 text-base">
          {isTasksLoading
            ? "Tasks"
            : `Tasks · ${String(doneCount)} of ${String(tasks.length)} done`}
        </Text>
        {isTasksLoading ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading tasks…
          </Text>
        ) : null}
        {!isTasksLoading && tasksQuery.isError ? (
          <Text as="p" className="text-sm text-[#ef4444]">
            Could not load tasks.
          </Text>
        ) : null}
        {!isTasksLoading && !tasksQuery.isError && tasks.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            No tasks yet.
          </Text>
        ) : null}
        {!isTasksLoading && !tasksQuery.isError && tasks.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-2.5 border-b border-[rgba(15,23,42,0.06)] py-2 last:border-b-0"
              >
                <span
                  className={[
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
                    task.done
                      ? "bg-[#0891a6] text-white"
                      : "border border-[rgba(15,23,42,0.2)]",
                  ].join(" ")}
                  aria-hidden
                >
                  {task.done ? (
                    <Icon icon="mdi:check" className="size-2.5" />
                  ) : null}
                </span>
                <span
                  className={[
                    "text-base leading-snug",
                    task.done
                      ? "text-ehs-muted-text line-through"
                      : "text-ehs-darker",
                  ].join(" ")}
                >
                  {task.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-[rgba(15,23,42,0.08)] px-5 pt-3.5 pb-3">
        <Button
          type="button"
          variant="primary"
          className="min-w-0 flex-1 gap-2 rounded-2.5 px-4 py-2.5 text-sm font-bold"
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
    <div className="min-w-0">
      <p className="text-ehs-muted-text text-xs tracking-[0.4px] uppercase">
        {label}
      </p>
      <p className="text-ehs-darker mt-1 truncate text-sm font-semibold capitalize">
        {value}
      </p>
    </div>
  );
}
