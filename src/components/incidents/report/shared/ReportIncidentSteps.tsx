"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  REPORT_STEPS,
  type ReportStepId,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportIncidentStepsProps = Readonly<{
  currentStep: ReportStepId;
  onStepChange: (step: ReportStepId) => void;
  className?: string;
}>;

export function ReportIncidentSteps(props: Readonly<ReportIncidentStepsProps>) {
  const { currentStep, onStepChange, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-3.5"
      className={["w-full md:sticky md:top-0 md:w-55 md:shrink-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        className="text-ehs-muted-text px-2 pt-1.25 pb-2.75 text-xs font-bold tracking-[1.05px] uppercase"
      >
        Steps
      </Text>

      <div className="flex flex-col gap-0.5">
        {REPORT_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={[
                "rounded-2.5 flex w-full items-start gap-2.5 p-2.5 text-left transition-colors",
                isActive ? "bg-ehs-normal-blue/18" : "hover:bg-ehs-light-bg/80",
              ].join(" ")}
            >
              <span
                className={[
                  "rounded-2.75 inline-flex size-5.5 shrink-0 items-center justify-center text-xs font-bold",
                  isComplete
                    ? "bg-ehs-green text-ehs-on-accent"
                    : isActive
                      ? "bg-ehs-normal-blue text-ehs-on-accent"
                      : "text-ehs-gray border-ehs-border-strong bg-ehs-surface/82 border",
                ].join(" ")}
              >
                {isComplete ? (
                  <Icon
                    icon="mdi:check"
                    className="size-2.75"
                    aria-hidden="true"
                  />
                ) : (
                  String(step.id)
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <Text
                  as="span"
                  className={[
                    "leading-normal",
                    isActive
                      ? "text-ehs-dark-blue text-[12px] font-bold"
                      : "text-ehs-dark-bg text-[12px] font-normal",
                  ].join(" ")}
                >
                  {step.title}
                </Text>
                <Text
                  as="span"
                  className="text-ehs-muted-text text-xs leading-normal font-normal"
                >
                  {step.description}
                </Text>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-ehs-border-ink/8 mt-4.5 border-t px-2 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Text as="span" className="text-ehs-muted-text text-xs">
            Progress
          </Text>
          <Text as="span" className="text-ehs-muted-text text-xs">
            {`${String(currentStep)} / 5`}
          </Text>
        </div>
        <div className="bg-ehs-muted-text/20 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-ehs-normal-blue h-full rounded-full transition-all"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
