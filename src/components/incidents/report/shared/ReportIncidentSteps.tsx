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

type StepStatus = "complete" | "active" | "upcoming";

/**
 * Circular step marker. `ring` draws the halo outside the 28px circle without
 * shifting the rail it sits on, so the node stays centred on the spine.
 */
const markerClassByStatus: Record<StepStatus, string> = {
  complete: "border-ehs-green bg-ehs-green text-ehs-on-accent border",
  active:
    "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-on-accent ring-ehs-normal-blue/20 border ring-4",
  upcoming: "text-ehs-gray border-ehs-border-strong bg-ehs-surface/82 border",
};

const rowClassByStatus: Record<StepStatus, string> = {
  complete: "hover:bg-ehs-light-bg/80 border border-transparent",
  active: "bg-ehs-normal-blue/18 border-ehs-normal-blue/15 border",
  upcoming: "hover:bg-ehs-light-bg/80 border border-transparent",
};

const titleClassByStatus: Record<StepStatus, string> = {
  complete: "text-ehs-dark-bg font-medium",
  active: "text-ehs-dark-blue font-bold",
  upcoming: "text-ehs-dark-bg font-normal",
};

/** Announced to screen readers only — the circle and tint carry it visually. */
const statusLabel: Record<StepStatus, string> = {
  complete: "Completed",
  active: "Current step",
  upcoming: "Not started",
};

function resolveStepStatus(
  stepId: ReportStepId,
  currentStep: ReportStepId,
): StepStatus {
  if (stepId < currentStep) return "complete";
  if (stepId === currentStep) return "active";
  return "upcoming";
}

export function ReportIncidentSteps(props: Readonly<ReportIncidentStepsProps>) {
  const { currentStep, onStepChange, className = "" } = props;

  const totalSteps = REPORT_STEPS.length;
  const lastStepId = REPORT_STEPS[totalSteps - 1]?.id;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <IncidentGlassCard
      paddingClassName="p-3.5"
      className={["w-full md:sticky md:top-0 md:w-55 md:shrink-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        id="report-steps-heading"
        className="text-ehs-muted-text px-2 pt-1.25 pb-2.75 text-xs font-bold tracking-[1.05px] uppercase"
      >
        Steps
      </Text>

      <ol aria-labelledby="report-steps-heading" className="flex flex-col">
        {REPORT_STEPS.map((step) => {
          const status = resolveStepStatus(step.id, currentStep);
          const isComplete = status === "complete";
          const isLast = step.id === lastStepId;

          return (
            <li key={step.id} className="relative">
              {/*
                Connector rail. Sits behind the row, running from just under
                this marker to the next one: left-6 is the marker's centre
                (p-2.5 padding + half of size-7), so the spine threads every
                circle. The last step has nothing to connect to.
              */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-10.5 bottom-0 left-6 w-0.5 -translate-x-1/2 rounded-full",
                    isComplete ? "bg-ehs-green/40" : "bg-ehs-border-ink/10",
                  ].join(" ")}
                />
              )}

              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                aria-current={status === "active" ? "step" : undefined}
                className={[
                  "rounded-2.5 focus-visible:ring-ehs-normal-blue/40 relative flex w-full cursor-pointer items-start gap-2.5 p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  rowClassByStatus[status],
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    markerClassByStatus[status],
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Icon
                      icon="mdi:check"
                      className="size-4"
                      aria-hidden="true"
                    />
                  ) : (
                    String(step.id)
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 pt-0.75">
                  <Text
                    as="span"
                    className={[
                      "text-xs leading-normal",
                      titleClassByStatus[status],
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
                <span className="sr-only">{statusLabel[status]}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="border-ehs-border-ink/8 mt-4.5 border-t px-2 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <Text as="span" className="text-ehs-muted-text text-xs">
            Progress
          </Text>
          <Text as="span" className="text-ehs-muted-text text-xs">
            {`${String(currentStep)} / ${String(totalSteps)}`}
          </Text>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Report progress"
          className="bg-ehs-muted-text/20 h-1.5 w-full overflow-hidden rounded-full"
        >
          <div
            className="bg-ehs-normal-blue h-full rounded-full transition-all duration-300"
            style={{ width: `${String(progressPercent)}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
