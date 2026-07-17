"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
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
      paddingClassName="p-[14px]"
      className={[
        "w-full lg:sticky lg:top-0 lg:w-[220px] lg:shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        className="text-ehs-muted-text px-2 pt-[5px] pb-[11px] text-[10.5px] font-bold tracking-[1.05px] uppercase"
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
                "flex w-full items-start gap-2.5 rounded-[10px] p-[10px] text-left transition-colors",
                isActive
                  ? "bg-ehs-normal-blue/18"
                  : "hover:bg-ehs-light-bg/80",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex size-[22px] shrink-0 items-center justify-center rounded-[11px] text-[10px] font-bold",
                  isComplete
                    ? "bg-ehs-green text-white"
                    : isActive
                      ? "bg-ehs-normal-blue text-white"
                      : "border border-[rgba(15,23,42,0.14)] bg-white/82 text-ehs-gray",
                ].join(" ")}
              >
                {isComplete ? (
                  <Icon
                    icon="mdi:check"
                    className="size-[11px]"
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
                      ? "text-ehs-dark-blue text-[12.3px] font-bold"
                      : "text-ehs-dark-bg text-[12.3px] font-normal",
                  ].join(" ")}
                >
                  {step.title}
                </Text>
                <Text
                  as="span"
                  className="text-ehs-muted-text text-[10.5px] leading-normal font-normal"
                >
                  {step.description}
                </Text>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-[18px] border-t border-[rgba(15,23,42,0.08)] px-2 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Text as="span" className="text-ehs-muted-text text-[10.5px]">
            Progress
          </Text>
          <Text as="span" className="text-ehs-muted-text text-[10.2px]">
            {`${String(currentStep)} / 5`}
          </Text>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(136,146,163,0.2)]">
          <div
            className="bg-ehs-normal-blue h-full rounded-full transition-all"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
