"use client";

import { Fragment } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import {
  CAPA_DETAIL_WORKFLOW_STEPS,
  type CapaDetailRecord,
} from "@/components/capa/detail/capa-detail-data";

export type CapaDetailProgressCardProps = Readonly<{
  record: CapaDetailRecord;
}>;

/** Workflow stepper + overall progress — Figma 1366:3125. */
export function CapaDetailProgressCard(props: CapaDetailProgressCardProps) {
  const { record } = props;
  const current = record.workflowStep;

  return (
    <IncidentGlassCard paddingClassName="p-5" className="min-w-0 rounded-2xl">
      <ol className="mb-5 flex w-full items-start">
        {CAPA_DETAIL_WORKFLOW_STEPS.map((label, index) => {
          const step = index + 1;
          const isDone = step < current;
          const isCurrent = step === current;
          const isLast = index === CAPA_DETAIL_WORKFLOW_STEPS.length - 1;
          const lineDone = step < current;

          return (
            <Fragment key={label}>
              <li className="flex shrink-0 flex-col items-center gap-2">
                <span
                  className={[
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    isDone
                      ? "bg-[#00c950] text-[#f6f6f6]"
                      : isCurrent
                        ? "bg-ehs-normal-blue text-[#f6f6f6]"
                        : "border border-[rgba(15,23,42,0.12)] bg-[#eef1f6] text-[#8892a3]",
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
                    "text-center text-sm leading-tight font-medium",
                    isDone
                      ? "text-[#10b981]"
                      : isCurrent
                        ? "text-[#0891a6]"
                        : "text-[#8892a3]",
                  ].join(" ")}
                >
                  {label}
                </Text>
              </li>

              {isLast ? null : (
                <li
                  className="mt-4 flex min-w-0 flex-1 items-center self-start px-2"
                  aria-hidden
                >
                  <div
                    className={[
                      "h-0.5 w-full",
                      lineDone ? "bg-[#00c950]" : "bg-[#eef1f6]",
                    ].join(" ")}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>

      <div className="flex items-center gap-3">
        <Text as="span" className="shrink-0 text-base text-[#566072]">
          Overall
        </Text>
        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(record.progress)}%` }}
          />
        </div>
        <Text
          as="span"
          className="shrink-0 text-sm font-semibold text-[#0b1320] tabular-nums"
        >
          {`${String(record.progress)}%`}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
