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
  "relative flex h-auto min-h-[60px] w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-3.5 rounded-2xl border border-white/80 bg-white/60 p-3 sm:px-4 sm:py-3.5 shadow-sm backdrop-blur-md";

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
      <div className="flex shrink-0 items-center">
        <span className="border-ehs-border/80 text-ehs-darker inline-flex h-8 w-fit shrink-0 items-center gap-1.5 rounded-lg border bg-white/80 px-2.5 text-xs font-bold shadow-xs">
          <img
            src="/icons/filter-variant.svg"
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0"
            aria-hidden="true"
          />
          Filters
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
        <IncidentSegmentedControl
          label="State"
          options={STATE_FILTERS}
          value={state}
          onChange={onStateChange}
          className="min-w-fit flex-1"
        />

        <IncidentSegmentedControl
          label="Stage"
          options={STAGE_FILTERS}
          value={stage}
          onChange={onStageChange}
          className="min-w-fit flex-[1.3]"
        />

        <IncidentSegmentedControl
          label="Severity"
          options={SEVERITY_FILTERS}
          value={severity}
          onChange={onSeverityChange}
          className="min-w-fit flex-[1.6]"
        />
      </div>
    </div>
  );
}
