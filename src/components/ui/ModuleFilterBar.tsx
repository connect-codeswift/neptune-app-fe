"use client";

import { Icon } from "@iconify/react";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type ModuleFilterOption = Readonly<{
  value: string;
  label: string;
}>;

export type ModuleFilterSegment = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Prefer `{ value, label }`; plain strings use the same text for both. */
  options: readonly ModuleFilterOption[] | readonly string[];
  disabled?: boolean;
}>;

export type ModuleFilterAction = Readonly<{
  label: string;
  onClick: () => void;
  icon?: string;
}>;

export type ModuleFilterBarProps = Readonly<{
  segments: readonly ModuleFilterSegment[];
  action?: ModuleFilterAction;
  className?: string;
}>;

const shellClass =
  "flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white/60 px-5 py-3 shadow-md";

function toOptions(
  options: ModuleFilterSegment["options"],
): readonly ModuleFilterOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

function FilterSegment(props: ModuleFilterSegment) {
  const { label, options, value, onChange, disabled = false } = props;
  const normalized = toOptions(options);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text6 text-ehs-muted-text shrink-0">{label}</span>

      <div className="border-ehs-border flex flex-wrap items-center gap-1 rounded-lg border bg-white/60 p-1">
        {normalized.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value === "" ? `${label}-all` : option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={[
                "text8 cursor-pointer rounded-md px-2 py-1 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-text"
                  : "text-ehs-gray hover:bg-black/5",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shared module filter strip — Filters chip + pill segments + optional CTA.
 * Used by Near Miss, Hazard, Audits, Inspections, and BBS.
 */
export function ModuleFilterBar(props: ModuleFilterBarProps) {
  const { segments, action, className = "" } = props;

  return (
    <div className={[shellClass, className].filter(Boolean).join(" ")}>
      <div className="flex items-center gap-4">
        <span className="text8 text-ehs-gray border-ehs-border inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white/60 p-2 font-bold">
          <Icon
            icon="mdi:filter-variant"
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          Filters
        </span>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {segments.map((segment) => (
            <FilterSegment key={segment.label} {...segment} />
          ))}
        </div>
      </div>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className={[
            "btn-sweep bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active ml-auto inline-flex cursor-pointer items-center justify-center shadow-sm",
            TABLE_HEADER_ACTION_CLASS,
          ].join(" ")}
        >
          <Icon
            icon={action.icon ?? "mdi:plus"}
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
