"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type ClosureStepId = 1 | 2 | 3 | 4;

/**
 * Progress, not navigation.
 *
 * These rows used to be buttons that jumped between steps, which gave the
 * closer a second way back into a part-finished closure alongside the Drafts
 * button — and one that skipped the draft entirely, so a jump to step 3 landed
 * on whatever happened to be in memory rather than on what was saved. The flow
 * is now: forward with Proceed, back with the step's own Back button, and back
 * into a saved draft only through Drafts.
 */
export type IncidentClosureStepsSidebarProps = Readonly<{
  currentStep: ClosureStepId;
  maxAccessibleStep: ClosureStepId;
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
  const { currentStep, maxAccessibleStep } = props;
  const progressPercent = (currentStep / 4) * 100;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      incidentGlassCardClassName="gap-6"
      className="backdrop-blur-2.5 bg-ehs-surface/[0.62] h-fit shadow-none"
    >
      <Text
        as="h4"
        className="text8 text-ehs-muted-text font-bold tracking-[1.05px] uppercase"
      >
        Steps
      </Text>

      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = step.id < currentStep;
          const isLocked = step.id > maxAccessibleStep;

          return (
            <div
              key={step.id}
              // Reads as state, not as a control: no button, no hover lift, and
              // aria-current marks where the closer actually is.
              aria-current={isActive ? "step" : undefined}
              className={[
                "rounded-2.5 flex items-start gap-2.5 p-2.5 text-left transition-all duration-200",
                isActive
                  ? "bg-ehs-dark-blue-bg-light border-ehs-normal-blue/10 border"
                  : isLocked
                    ? "border border-transparent opacity-50"
                    : "border border-transparent",
              ].join(" ")}
            >
              <div
                className={[
                  "rounded-2.75 text8 mt-0.5 flex size-5.5 shrink-0 items-center justify-center transition-colors",
                  isComplete
                    ? "bg-ehs-green text-ehs-on-accent font-bold"
                    : isActive
                      ? "bg-ehs-normal-blue text-ehs-on-accent font-bold"
                      : "text-ehs-gray border-ehs-border-ink/8 bg-ehs-surface border font-bold",
                ].join(" ")}
              >
                {isComplete ? (
                  <Icon
                    icon="mdi:check"
                    className="size-2.75"
                    aria-hidden="true"
                  />
                ) : (
                  step.id
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Text
                  as="span"
                  className={[
                    "text8 leading-normal",
                    isActive
                      ? "text-ehs-normal-blue font-bold"
                      : "text-ehs-dark-bg font-medium",
                  ].join(" ")}
                >
                  {step.title}
                </Text>
                <Text
                  as="span"
                  className="text8 text-ehs-muted-text leading-normal font-normal"
                >
                  {step.subtitle}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-ehs-border-ink/8 flex flex-col gap-2 border-t pt-5">
        <div className="flex items-center justify-between">
          <Text as="span" className="text8 text-ehs-muted-text font-normal">
            Progress
          </Text>
          <Text as="span" className="text8 text-ehs-gray font-bold">
            {`${String(currentStep)} / 4`}
          </Text>
        </div>
        <div className="rounded-249.75 bg-ehs-muted-text/20 h-1.5 w-full overflow-hidden">
          <div
            className="rounded-249.75 bg-ehs-normal-blue h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
