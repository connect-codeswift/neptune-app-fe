"use client";

import { Icon } from "@iconify/react";

export type NearMissFilterBarProps = Readonly<{
  status: string;
  onStatusChange: (value: string) => void;
  onReportNearMiss: () => void;
  className?: string;
}>;

export const SEVERITY_OPTIONS = ["All", "High", "Medium", "Low"] as const;

export const STATUS_OPTIONS = [
  "All",
  "Open",
  "Investigating",
  "Closed",
] as const;

const shellClass =
  "flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl bg-white/70 px-5 py-3 shadow-xl";

type FilterSegmentProps = Readonly<{
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}>;

function FilterSegment(props: FilterSegmentProps) {
  const { label, options, value, onChange } = props;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-ehs-muted-text shrink-0 text-xs font-bold tracking-wide uppercase">
        {label}
      </span>

      <div className="border-ehs-border flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2">
        {options.map((option) => {
          const isActive = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={[
                "cursor-pointer rounded-md px-2.5 py-1 text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-text"
                  : "text-ehs-gray hover:bg-black/5",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function NearMissFilterBar(props: NearMissFilterBarProps) {
  const { status, onStatusChange, onReportNearMiss, className = "" } = props;

  return (
    <div className={[shellClass, className].filter(Boolean).join(" ")}>
      <span className="text-ehs-gray border-ehs-border inline-flex shrink-0 items-center gap-1.5 rounded-xl border bg-white p-2.5 text-sm font-bold">
        <Icon
          icon="mdi:filter-variant"
          className="size-5 shrink-0"
          aria-hidden="true"
        />
        Filters
      </span>

      <FilterSegment
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={onStatusChange}
      />

      <button
        type="button"
        onClick={onReportNearMiss}
        className="btn-sweep bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active ml-auto flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
      >
        <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
        Report Near Miss
      </button>
    </div>
  );
}
