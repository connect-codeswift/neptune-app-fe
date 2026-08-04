"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentDetailResponseAction } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { IncidentDetailResponseAction };

export type IncidentDetailResponseCardProps = Readonly<{
  actions?: readonly IncidentDetailResponseAction[];
  className?: string;
}>;

const DEFAULT_ACTIONS: readonly IncidentDetailResponseAction[] = [
  { id: "area-cordoned", label: "Area cordoned off", completed: true },
  { id: "loto", label: "Equipment locked out (LOTO)", completed: true },
  { id: "first-aid", label: "First aid administered", completed: false },
  { id: "supervisor-notified", label: "Supervisor notified", completed: true },
  { id: "spill-contained", label: "Spill contained", completed: true },
  { id: "photos-captured", label: "Photos captured", completed: true },
];

export function IncidentDetailResponseCard(
  props: Readonly<IncidentDetailResponseCardProps>,
) {
  const { actions = DEFAULT_ACTIONS, className = "" } = props;
  const rows = actions.length > 0 ? actions : DEFAULT_ACTIONS;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-[14px]"
      className={className}
    >
      <div className="flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Immediate response
        </Text>
        <span className="text-sm leading-normal text-ehs-muted-text">
          Actions taken on-scene
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((action) => (
          <div
            key={action.id}
            className={[
              "flex h-[38px] items-center gap-[10px] rounded-lg border px-[13px] py-[11px]",
              action.completed
                ? "border-ehs-green bg-ehs-green-bg-light"
                : "border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)]",
            ].join(" ")}
          >
            {action.completed ? (
              <div className="flex size-4 shrink-0 items-center justify-center rounded bg-ehs-green text-ehs-light-text">
                <Icon icon="mdi:check" className="size-[11px]" aria-hidden="true" />
              </div>
            ) : (
              <div className="size-4 shrink-0 rounded border border-[rgba(15,23,42,0.14)] bg-transparent" />
            )}
            <span className="truncate text-sm leading-normal text-ehs-dark-bg">
              {action.label}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
