"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type IncidentDetailResponseAction = Readonly<{
  id: string;
  label: string;
  completed: boolean;
}>;

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

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-2.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-[15px] font-bold"
        >
          Immediate response
        </Text>
        <span className="text-ehs-muted-text text-[10.5px]">
          Actions taken on-scene
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-3.5 sm:grid-cols-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className={[
              "flex min-h-[52px] items-center gap-3 rounded-[10px] border px-4 py-3 text-left",
              action.completed
                ? "border-[#0891a6]/40 bg-[#0891a6]/8 text-ehs-dark-blue font-semibold"
                : "border-[rgba(15,23,42,0.08)] bg-white/62 text-ehs-dark-bg font-normal",
            ].join(" ")}
          >
            {action.completed ? (
              <div className="bg-ehs-normal-blue flex size-5 shrink-0 items-center justify-center rounded-[4px] text-white">
                <Icon icon="mdi:check" className="size-3.5" />
              </div>
            ) : (
              <div className="size-5 shrink-0 rounded-[4px] border border-[rgba(15,23,42,0.18)] bg-white" />
            )}
            <span className="text-[13px] leading-normal">
              {action.label}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
