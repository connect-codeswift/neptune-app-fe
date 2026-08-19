"use client";

import { useId } from "react";
import { Icon } from "@iconify/react";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
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
  /** Primary CTA (e.g. New CAPA) — blue solid. */
  action?: ModuleFilterAction;
  /** Optional secondary CTA (e.g. My CAPAs) — sits left of primary. */
  secondaryAction?: ModuleFilterAction;
  /** Optional meta text rendered before the action group (e.g. "9 of 9"). */
  meta?: string;
  className?: string;
}>;

const shellClass =
  "flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-ehs-surface/60 px-4 py-3 shadow-md sm:px-5";

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
  const selectId = useId();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label
        htmlFor={selectId}
        className="text6 text-ehs-muted-text shrink-0 xl:pointer-events-none"
      >
        {label}
      </label>

      <div className="relative min-w-0 flex-1 xl:hidden">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className={[
            "border-ehs-border text4 text-ehs-dark-bg bg-ehs-surface/60 min-h-9 w-full min-w-36 cursor-pointer appearance-none rounded-lg border py-1.5 pr-8 pl-2.5 outline-none",
            "focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 hover:bg-ehs-surface-inverse/5",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {normalized.map((option) => (
            <option
              key={option.value === "" ? `${label}-all` : option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon="mdi:chevron-down"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>

      <div className="border-ehs-border bg-ehs-surface/60 hidden flex-wrap items-center gap-1 rounded-lg border px-1 py-1 xl:flex">
        {normalized.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value === "" ? `${label}-all` : option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={[
                "text4 cursor-pointer rounded-md px-2 py-1 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "bg-ehs-surface-inverse text-ehs-surface-inverse-text"
                  : "text-ehs-gray hover:bg-ehs-surface-inverse/5",
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
 * Shared module filter strip — Filters chip + segments + optional CTAs.
 * Below `xl`, segments render as select dropdowns; from `xl` up they use pills.
 * Used by Near Miss, Hazard, Audits, Inspections, Incidents, and BBS.
 */
export function ModuleFilterBar(props: ModuleFilterBarProps) {
  const { segments, action, secondaryAction, meta, className = "" } = props;
  const hasActions = Boolean(action || secondaryAction || meta);

  return (
    <div className={[shellClass, className].filter(Boolean).join(" ")}>
      {segments.map((segment) => (
        <FilterSegment key={segment.label} {...segment} />
      ))}

      {hasActions ? (
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          {meta ? (
            <span className="text4 text-ehs-muted-text shrink-0 tabular-nums">
              {meta}
            </span>
          ) : null}

          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={[
                "border-ehs-border text-ehs-darker bg-ehs-surface/80 hover:bg-ehs-surface-inverse/5 inline-flex min-h-9 cursor-pointer items-center justify-center border shadow-sm",
                TABLE_HEADER_SECONDARY_ACTION_CLASS,
              ].join(" ")}
            >
              <Icon
                icon={secondaryAction.icon ?? "mdi:account-outline"}
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden="true"
              />
              {secondaryAction.label}
            </button>
          ) : null}

          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className={[
                "bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active inline-flex min-h-9 cursor-pointer items-center justify-center shadow-sm",
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
      ) : null}
    </div>
  );
}
