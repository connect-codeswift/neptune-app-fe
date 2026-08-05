"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { StatusChecklistRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { StatusChecklistRow };

export type IncidentDetailInvestigationStatusCardProps = Readonly<{
  steps?: readonly StatusChecklistRow[];
  isLoading?: boolean;
  className?: string;
}>;

const DEFAULT_STEPS: readonly StatusChecklistRow[] = [
  { label: "Evidence collected", completed: false },
  { label: "Witnesses interviewed", completed: false },
  { label: "Contributing factors documented", completed: false },
  { label: "Root cause identified", completed: false },
  { label: "Corrective actions defined", completed: false },
  { label: "Closed-out", completed: false },
];

export function IncidentDetailInvestigationStatusCard(
  props: Readonly<IncidentDetailInvestigationStatusCardProps>,
) {
  const { steps = DEFAULT_STEPS, isLoading = false, className = "" } = props;

  const completedCount = steps.filter((step) => step.completed).length;
  const percentage =
    steps.length === 0
      ? 0
      : Math.min(100, Math.round((completedCount / steps.length) * 100));

  return (
    <IncidentGlassCard
      paddingClassName="p-[18px]"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <Text
        as="h3"
        className="pb-[14px] text-ehs-dark-bg text-lg font-semibold"
      >
        Investigation status
      </Text>

      <div className="flex flex-col">
        {isLoading ? (
          <p className="py-4 text-sm text-ehs-muted-text">
            Loading investigation progress…
          </p>
        ) : (
          steps.map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-2.5 border-t border-[rgba(15,23,42,0.08)] pt-2.5 pb-[9px]"
            >
              {step.completed ? (
                <div className="flex size-[18px] shrink-0 items-center justify-center rounded-[9px] bg-ehs-green text-ehs-light-text">
                  <Icon icon="mdi:check" className="size-[11px]" aria-hidden="true" />
                </div>
              ) : (
                <div className="size-[18px] shrink-0 rounded-[9px] border border-[rgba(15,23,42,0.14)] bg-transparent" />
              )}
              <span
                className={[
                  "text-sm leading-normal",
                  step.completed ? "text-ehs-dark-bg" : "text-ehs-gray",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
          ))
        )}
      </div>

      {!isLoading ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ehs-muted-text/20">
            <div
              className="h-full rounded-full bg-ehs-normal-blue transition-all duration-300"
              style={{ width: `${String(percentage)}%` }}
            />
          </div>
          <span className="text-sm leading-normal text-ehs-muted-text">
            {completedCount} of {steps.length} complete
          </span>
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
