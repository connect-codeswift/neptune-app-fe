"use client";

import { IncidentSegmentedControl } from "@/components/incidents/list/IncidentSegmentedControl";
import {
  SEVERITY_FILTERS,
  STAGE_FILTERS,
  STATE_FILTERS,
} from "@/components/incidents/list/incident-list-data";

export type IncidentFilterBarProps = Readonly<{
  state: string;
  stage: string;
  severity: string;
  onStateChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  className?: string;
}>;

/** Figma 1518:2576 — desktop 1150×90; stacks/wraps below xl */
const shellClass =
  "relative flex min-h-[90px] items-center rounded-[20px] border border-white/90 bg-white/[0.62] px-3 py-4 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:content-[''] before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)] xl:min-h-[96px] xl:py-0 xl:pr-[9px]";

export function IncidentFilterBar(props: Readonly<IncidentFilterBarProps>) {
  const {
    state,
    stage,
    severity,
    onStateChange,
    onStageChange,
    onSeverityChange,
    className = "",
  } = props;

  return (
    <div className={[shellClass, className].filter(Boolean).join(" ")}>
      <div className="relative z-[1] flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:gap-[9px]">
        <span className="border-ehs-border text-ehs-gray inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-[8px] border bg-white/[0.82] px-[9px] text-[11px] font-bold">
          <img
            src="/icons/filter-variant.svg"
            alt=""
            width={12}
            height={12}
            className="size-3 shrink-0"
            aria-hidden="true"
          />
          Filters
        </span>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:gap-4">
          <IncidentSegmentedControl
            label="State"
            options={STATE_FILTERS}
            value={state}
            onChange={onStateChange}
            className="sm:flex-1"
          />

          <IncidentSegmentedControl
            label="Stage"
            options={STAGE_FILTERS}
            value={stage}
            onChange={onStageChange}
            className="sm:flex-[1.4]"
          />

          <IncidentSegmentedControl
            label="Severity"
            options={SEVERITY_FILTERS}
            value={severity}
            onChange={onSeverityChange}
            className="sm:flex-[1.7]"
          />
        </div>
      </div>
    </div>
  );
}
