"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type StatusChecklistRow = Readonly<{
  label: string;
  completed: boolean;
}>;

export type IncidentDetailInvestigationStatusCardProps = Readonly<{
  steps?: readonly StatusChecklistRow[];
  className?: string;
}>;

const DEFAULT_STEPS: readonly StatusChecklistRow[] = [
  { label: "Evidence collected", completed: true },
  { label: "Witnesses interviewed", completed: true },
  { label: "Root cause identified", completed: true },
  { label: "CAPA defined", completed: true },
  { label: "Manager sign-off", completed: false },
  { label: "Closed-out", completed: false },
];

export function IncidentDetailInvestigationStatusCard(
  props: Readonly<IncidentDetailInvestigationStatusCardProps>,
) {
  const { steps = DEFAULT_STEPS, className = "" } = props;

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.min(
    100,
    Math.round((completedCount / steps.length) * 100),
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[14.8px] font-bold"
      >
        Investigation status
      </Text>

      {/* Checklist items */}
      <div className="flex flex-col gap-3.5 pt-4">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-3 text-[12px] text-ehs-dark-bg font-semibold"
          >
            {step.completed ? (
              <div className="bg-[#10b981]/12 flex size-[20px] shrink-0 items-center justify-center rounded-full text-[#10b981] border border-[#10b981]/20">
                <Icon icon="mdi:check" className="size-3.5" />
              </div>
            ) : (
              <div className="size-[20px] shrink-0 rounded-full border border-[rgba(15,23,42,0.18)] bg-white" />
            )}
            <span
              className={
                step.completed ? "text-ehs-dark-bg" : "text-ehs-muted-text font-normal"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress metrics */}
      <div className="flex flex-col gap-2 mt-5 border-t border-[rgba(15,23,42,0.04)] pt-4">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.06)]">
          <div
            className="h-full rounded-full bg-ehs-normal-blue transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] text-ehs-muted-text font-semibold">
          {completedCount} of {steps.length} complete
        </span>
      </div>
    </IncidentGlassCard>
  );
}
