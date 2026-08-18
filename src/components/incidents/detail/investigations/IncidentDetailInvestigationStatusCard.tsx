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
      paddingClassName="p-4.5"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <Text as="h3" className="text-ehs-dark-bg text3 pb-3.5">
        Investigation status
      </Text>

      <div className="flex flex-col">
        {isLoading ? (
          <p className="text-ehs-muted-text text4 py-4">
            Loading investigation progress…
          </p>
        ) : (
          steps.map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-2.5 border-t border-[rgba(15,23,42,0.08)] pt-2.5 pb-2.25"
            >
              {step.completed ? (
                <div className="bg-ehs-green text-ehs-light-text rounded-2.25 flex size-4.5 shrink-0 items-center justify-center">
                  <Icon
                    icon="mdi:check"
                    className="size-2.75"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="rounded-2.25 size-4.5 shrink-0 border border-[rgba(15,23,42,0.14)] bg-transparent" />
              )}
              <span
                className={[
                  "text4 leading-normal",
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
          <div className="bg-ehs-muted-text/20 relative h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-ehs-normal-blue h-full rounded-full transition-all duration-300"
              style={{ width: `${String(percentage)}%` }}
            />
          </div>
          <span className="text-ehs-muted-text text4 leading-normal">
            {completedCount} of {steps.length} complete
          </span>
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
