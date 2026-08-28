"use client";

import {
  ReportFieldLabel,
  ReportFieldError,
  ReportFieldHint,
} from "./ReportFormField";
import type { ClassificationValue } from "./report-classification";

export type ClassificationToggleOption = Readonly<{
  value: string;
  label: string;
}>;

export type ReportClassificationToggleProps = Readonly<{
  id?: string;
  label: string;
  required?: boolean;
  hint?: string;
  value: ClassificationValue;
  error?: string | null;
  onChange: (next: ClassificationValue) => void;
  /** Defaults to Yes / No labels. */
  options?: readonly ClassificationToggleOption[];
}>;

const DEFAULT_OPTIONS: readonly ClassificationToggleOption[] = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const SIA_SIP_SIF_VALUES = ["SIA", "SIP", "SIF"] as const;

type SiaSipSifValue = (typeof SIA_SIP_SIF_VALUES)[number];

const SIA_SIP_SIF_STYLES: Record<
  SiaSipSifValue,
  Readonly<{ pane: string; activeText: string }>
> = {
  SIA: {
    pane: "bg-ehs-orange shadow-[0px_4px_14px_-4px_color-mix(in_oklab,var(--ehs-orange)_55%,transparent),inset_0px_1px_0px_rgba(255,255,255,0.35)]",
    activeText: "text-ehs-on-accent",
  },
  SIP: {
    pane: "bg-ehs-yellow shadow-[0px_4px_14px_-4px_color-mix(in_oklab,var(--ehs-yellow)_55%,transparent),inset_0px_1px_0px_rgba(255,255,255,0.35)]",
    activeText: "text-ehs-on-accent",
  },
  SIF: {
    pane: "bg-ehs-red shadow-[0px_4px_14px_-4px_color-mix(in_oklab,var(--ehs-red)_55%,transparent),inset_0px_1px_0px_rgba(255,255,255,0.35)]",
    activeText: "text-ehs-on-accent",
  },
};

function isSiaSipSifToggle(
  options: readonly ClassificationToggleOption[],
): boolean {
  return (
    options.length === 3 &&
    SIA_SIP_SIF_VALUES.every((value) =>
      options.some((option) => option.value === value),
    )
  );
}

/**
 * One classification question as a segmented control instead of a dropdown.
 *
 * Supports two-option Yes/No toggles and three-option SIA/SIP/SIF pickers.
 * SIA/SIP/SIF use orange, yellow, and red sliding panes respectively.
 */
export function ReportClassificationToggle(
  props: Readonly<ReportClassificationToggleProps>,
) {
  const {
    id,
    label,
    required = false,
    hint,
    value,
    error = null,
    onChange,
    options,
  } = props;

  const resolvedOptions = options ?? DEFAULT_OPTIONS;
  const optionCount = resolvedOptions.length;
  const usesSeverityColors = isSiaSipSifToggle(resolvedOptions);
  const hasSelection = resolvedOptions.some((option) => option.value === value);
  const resolvedValue = hasSelection ? value : "";
  const selectedIndex = hasSelection
    ? resolvedOptions.findIndex((option) => option.value === resolvedValue)
    : -1;
  const selectedSiaStyle =
    usesSeverityColors && hasSelection
      ? SIA_SIP_SIF_STYLES[resolvedValue as SiaSipSifValue]
      : undefined;
  const isPrimarySelected =
    hasSelection && selectedIndex === 0 && !usesSeverityColors;

  return (
    <div
      className="flex flex-col gap-1.5"
      data-field-error={error ? "true" : undefined}
    >
      <ReportFieldLabel label={label} required={required} />
      <div
        role="group"
        aria-label={label}
        data-invalid={error ? "true" : undefined}
        className={[
          "rounded-2.5 border-ehs-hairline/70 bg-ehs-surface/45 relative grid h-10 border p-1 shadow-[inset_0px_2px_4px_rgba(15,23,42,0.06)] backdrop-blur-md",
          optionCount === 3 ? "grid-cols-3" : "grid-cols-2",
          error ? "border-ehs-red/50" : "",
        ].join(" ")}
      >
        {hasSelection ? (
          <span
            aria-hidden="true"
            className={[
              "rounded-1.75 pointer-events-none absolute top-1 bottom-1 transition-all duration-200",
              selectedSiaStyle
                ? selectedSiaStyle.pane
                : isPrimarySelected
                  ? "from-ehs-normal-blue to-ehs-dark-blue bg-linear-to-br shadow-[0px_4px_14px_-4px_color-mix(in_oklab,var(--ehs-normal-blue)_70%,transparent),inset_0px_1px_0px_rgba(255,255,255,0.35)]"
                  : "border-ehs-hairline/70 bg-ehs-surface/85 border shadow-[0px_2px_6px_-1px_rgba(15,23,42,0.18)]",
            ].join(" ")}
            style={{
              width: `calc(${100 / optionCount}% - 4px)`,
              left: "4px",
              transform: `translateX(calc(${selectedIndex * 100}%))`,
            }}
          />
        ) : null}
        {resolvedOptions.map((option, index) => {
          const active = resolvedValue === option.value;
          const optionStyle =
            usesSeverityColors && active
              ? SIA_SIP_SIF_STYLES[option.value as SiaSipSifValue]
              : undefined;

          return (
            <button
              key={option.value}
              id={index === 0 ? id : undefined}
              type="button"
              aria-pressed={active}
              aria-label={option.label}
              onClick={() => onChange(option.value as ClassificationValue)}
              className={[
                "rounded-1.75 relative z-10 text-sm font-bold transition-colors duration-200",
                "focus-visible:ring-ehs-normal-blue/45 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                active
                  ? optionStyle
                    ? optionStyle.activeText
                    : isPrimarySelected && index === 0
                      ? "text-ehs-on-accent"
                      : "text-ehs-slate"
                  : "text-ehs-muted-text hover:text-ehs-slate",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint && !error ? (
        <ReportFieldHint withIcon>{hint}</ReportFieldHint>
      ) : null}
      {error ? <ReportFieldError>{error}</ReportFieldError> : null}
    </div>
  );
}
