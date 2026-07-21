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

const shellClass =
  "relative flex h-auto min-h-[72px] w-full min-w-0 items-center rounded-[20px] border border-white/90 bg-white/[0.62] px-3.5 py-3.5 sm:px-4 sm:py-4 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:content-[''] before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)] xl:min-h-[96px] xl:py-0 xl:pr-[9px]";

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
      <div className="relative z-[1] flex w-full min-w-0 flex-col gap-3.5 xl:flex-row xl:items-center xl:gap-3">
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

        <div className="grid w-full min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-1 xl:items-center xl:gap-3">
          <IncidentSegmentedControl
            label="State"
            options={STATE_FILTERS}
            value={state}
            onChange={onStateChange}
            className="w-full xl:flex-1"
          />

          <IncidentSegmentedControl
            label="Stage"
            options={STAGE_FILTERS}
            value={stage}
            onChange={onStageChange}
            className="w-full xl:flex-[1.4]"
          />

          <IncidentSegmentedControl
            label="Severity"
            options={SEVERITY_FILTERS}
            value={severity}
            onChange={onSeverityChange}
            className="w-full md:col-span-2 lg:col-span-1 xl:flex-[1.7]"
          />
        </div>
      </div>
    </div>
  );
}
