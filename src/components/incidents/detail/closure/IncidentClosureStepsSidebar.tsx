"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type ClosureStepId = 1 | 2 | 3 | 4;

export type IncidentClosureStepsSidebarProps = Readonly<{
  currentStep: ClosureStepId;
  maxAccessibleStep: ClosureStepId;
  onSelectStep: (step: ClosureStepId) => void;
}>;

const STEPS = [
  {
    id: 1 as const,
    title: "Closure Classification",
    subtitle: "Type, severity & recordability",
  },
  {
    id: 2 as const,
    title: "Root Cause Summary",
    subtitle: "RCA, equipment & procedures",
  },
  {
    id: 3 as const,
    title: "Preventive Measures",
    subtitle: "Action plans & linked CAPAs",
  },
  {
    id: 4 as const,
    title: "Review & Sign-off",
    subtitle: "MFA signature & submission",
  },
];

export function IncidentClosureStepsSidebar(
  props: Readonly<IncidentClosureStepsSidebarProps>,
) {
  const { currentStep, maxAccessibleStep, onSelectStep } = props;
  const progressPercent = (currentStep / 4) * 100;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      incidentGlassCardClassName="gap-6"
      className="h-fit bg-white/[0.62] shadow-none backdrop-blur-[10px]"
    >
      <Text
        as="h4"
        className="text-[11px] font-bold tracking-[1.05px] text-ehs-muted-text uppercase"
      >
        Steps
      </Text>

      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = step.id < currentStep;
          const isLocked = step.id > maxAccessibleStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              disabled={isLocked}
              aria-disabled={isLocked}
              className={[
                "flex items-start gap-[10px] rounded-[10px] p-[10px] text-left transition-all duration-200",
                isActive
                  ? "bg-ehs-dark-blue-bg-light border border-[rgba(8,145,166,0.1)]"
                  : isLocked
                    ? "cursor-not-allowed border border-transparent opacity-50"
                    : "border border-transparent hover:bg-white/60",
              ].join(" ")}
            >
              <div
                className={[
                  "mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-[11px] text-[10px] transition-colors",
                  isComplete
                    ? "bg-ehs-green font-bold text-ehs-light-text"
                    : isActive
                      ? "bg-ehs-normal-blue font-bold text-ehs-light-text"
                      : "border border-[rgba(15,23,42,0.08)] bg-white font-bold text-ehs-gray",
                ].join(" ")}
              >
                {isComplete ? (
                  <Icon
                    icon="mdi:check"
                    className="size-[11px]"
                    aria-hidden="true"
                  />
                ) : (
                  step.id
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-[2px]">
                <Text
                  as="span"
                  className={[
                    "text-xs leading-normal",
                    isActive
                      ? "font-bold text-ehs-normal-blue"
                      : "font-medium text-ehs-dark-bg",
                  ].join(" ")}
                >
                  {step.title}
                </Text>
                <Text
                  as="span"
                  className="text-[10px] font-normal leading-normal text-ehs-muted-text"
                >
                  {step.subtitle}
                </Text>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-[rgba(15,23,42,0.08)] pt-5">
        <div className="flex items-center justify-between">
          <Text as="span" className="text-[10px] font-normal text-ehs-muted-text">
            Progress
          </Text>
          <Text as="span" className="text-[10px] font-bold text-ehs-gray">
            {`${String(currentStep)} / 4`}
          </Text>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-[999px] bg-ehs-muted-text/20">
          <div
            className="h-full rounded-[999px] bg-ehs-normal-blue transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
