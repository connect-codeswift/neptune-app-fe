"use client";

import { Fragment } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import {
  CAPA_DETAIL_WORKFLOW_STEPS,
  type CapaDetailRecord,
} from "@/components/capa/detail/capa-detail-data";
import { isCapaStatusClosed } from "@/lib/capa-filters";

/* The step labels are pinned to #f6f6f6, an off-white; `--ehs-on-accent` is
   pure white. */

export type CapaDetailProgressCardProps = Readonly<{
  record: CapaDetailRecord;
}>;

/** Workflow stepper + overall progress — Figma 1366:3125. */
export function CapaDetailProgressCard(props: CapaDetailProgressCardProps) {
  const { record } = props;
  const totalSteps = CAPA_DETAIL_WORKFLOW_STEPS.length;
  const isClosed = isCapaStatusClosed(record.statusLabel);
  const current = Math.min(Math.max(record.workflowStep, 1), totalSteps);
  const progress = Math.min(100, Math.max(0, record.progress));

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className="min-w-0 rounded-2xl"
    >
      <div className="-mx-1 mb-5 overflow-x-auto px-1">
        <ol className="flex w-full min-w-max items-start sm:min-w-0">
          {CAPA_DETAIL_WORKFLOW_STEPS.map((label, index) => {
            const step = index + 1;
            // Closed CAPAs tick every step, including the final "Closed" node.
            const isDone = isClosed || step < current;
            const isCurrent = !isClosed && step === current;
            const isLast = index === totalSteps - 1;
            const lineDone = isClosed || step < current;

            return (
              <Fragment key={label}>
                <li className="flex w-18 shrink-0 flex-col items-center gap-2 sm:w-auto sm:flex-1">
                  <span
                    className={[
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      isDone
                        ? "bg-ehs-progress-done text-[#f6f6f6]"
                        : isCurrent
                          ? "bg-ehs-normal-blue text-[#f6f6f6]"
                          : "border-ehs-border-ink/12 bg-ehs-form-classes-bg text-ehs-muted-text border",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <Icon icon="mdi:check" className="size-4" aria-hidden />
                    ) : (
                      String(step)
                    )}
                  </span>
                  <Text
                    as="span"
                    className={[
                      "max-w-18 text-center text-xs leading-tight font-medium sm:max-w-none sm:text-sm",
                      isDone
                        ? "text-ehs-green"
                        : isCurrent
                          ? "text-ehs-normal-blue"
                          : "text-ehs-muted-text",
                    ].join(" ")}
                  >
                    {label}
                  </Text>
                </li>

                {isLast ? null : (
                  <li
                    className="mt-4 flex min-w-3 flex-1 items-center self-start px-1 sm:min-w-0 sm:px-2"
                    aria-hidden
                  >
                    <div
                      className={[
                        "h-0.5 w-full",
                        lineDone
                          ? "bg-ehs-progress-done"
                          : "bg-ehs-form-classes-bg",
                      ].join(" ")}
                    />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>

      <div className="flex items-center gap-3">
        <Text as="span" className="text-ehs-gray shrink-0 text-base">
          Overall
        </Text>
        <div className="bg-ehs-surface-inverse/8 h-2.5 min-w-0 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(progress)}%` }}
          />
        </div>
        <Text
          as="span"
          className="text-ehs-dark-bg shrink-0 text-sm font-semibold tabular-nums"
        >
          {`${String(progress)}%`}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
