"use client";

import { useRef } from "react";
import { Text } from "@/components/Text";
import { ReportFieldError } from "@/components/incidents/report/shared/ReportFormField";

export type ReportOptionCardOption<T extends string = string> = Readonly<{
  id: T;
  label: string;
  /** Chip variant title lines (falls back to label). */
  lines?: readonly string[];
  /** Tile variant subtitle. */
  description?: string;
}>;

export type ReportOptionCardsProps<T extends string = string> = Readonly<{
  label: string;
  options: readonly ReportOptionCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  trailingHint?: string;
  /** chip = Step 1 severity; tile = Step 3 injury level */
  variant?: "chip" | "tile";
  ariaLabel?: string;
  error?: string | null;
  className?: string;
}>;

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function ReportOptionCards<T extends string>(
  props: Readonly<ReportOptionCardsProps<T>>,
) {
  const {
    label,
    options,
    value,
    onChange,
    required = false,
    trailingHint,
    variant = "chip",
    ariaLabel,
    error = null,
    className = "",
  } = props;

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = options.findIndex((option) => option.id === value);
  /** Which card is reachable by Tab — the standard roving-tabindex pattern. */
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  /**
   * Arrow keys move between radios and select as they go, per the WAI-ARIA
   * radiogroup pattern. Without this every card was its own tab stop and the
   * arrows did nothing, so the group was awkward to operate from a keyboard.
   */
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const lastIndex = options.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextOption = options[nextIndex];
    if (!nextOption) {
      return;
    }

    onChange(nextOption.id);
    buttonsRef.current[nextIndex]?.focus();
  }

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
      data-field-error={error ? "true" : undefined}
    >
      <div className="flex flex-wrap items-end gap-x-1.5 gap-y-0.5">
        <Text as="span" className="text-sm font-bold text-ehs-slate">
          {label}
        </Text>
        {required ? (
          <Text as="span" className="text-ehs-red text-sm">
            *
          </Text>
        ) : null}
        {trailingHint ? (
          <Text as="span" className="text-ehs-muted-text ml-auto text-xs">
            {trailingHint}
          </Text>
        ) : null}
      </div>

      <div
        className={
          variant === "tile"
            ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            : "flex flex-wrap items-center gap-2"
        }
        role="radiogroup"
        aria-label={ariaLabel ?? label}
        aria-invalid={error ? true : undefined}
      >
        {options.map((option, index) => {
          const isSelected = option.id === value;

          const shared = {
            ref: (node: HTMLButtonElement | null) => {
              buttonsRef.current[index] = node;
            },
            type: "button" as const,
            role: "radio",
            "aria-checked": isSelected,
            tabIndex: index === tabbableIndex ? 0 : -1,
            onClick: () => {
              onChange(option.id);
            },
            onKeyDown: (event: React.KeyboardEvent) => {
              handleKeyDown(event, index);
            },
          };

          if (variant === "tile") {
            return (
              <button
                key={option.id}
                {...shared}
                className={[
                  "flex min-h-[57px] cursor-pointer flex-col items-start gap-0.5 rounded-[10px] border p-[13px] text-left transition-all duration-200",
                  FOCUS_RING,
                  isSelected
                    ? "border-ehs-normal-blue bg-ehs-normal-blue/18 shadow-[0_0_0_1px_rgba(8,145,166,0.12)]"
                    : "border-[rgba(15,23,42,0.08)] bg-white/62 hover:border-[rgba(15,23,42,0.16)] hover:bg-white/80",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-sm leading-normal font-bold",
                    isSelected ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                  ].join(" ")}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-ehs-muted-text text-sm leading-normal">
                    {option.description}
                  </span>
                ) : null}
              </button>
            );
          }

          return (
            <button
              key={option.id}
              {...shared}
              className={[
                // Auto width, single line, label only. Fixed equal widths
                // forced the long labels to wrap while SIA/SIP sat in mostly
                // empty boxes, and the ragged one- vs two-line heights never
                // lined up — sizing to content fixes all three at once.
                "inline-flex cursor-pointer items-center rounded-full border px-3.5 py-2 text-sm leading-none whitespace-nowrap transition-colors duration-150",
                FOCUS_RING,
                isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue/[0.10] text-ehs-dark-blue font-bold"
                  : "text-ehs-gray hover:text-ehs-dark-bg border-[rgba(15,23,42,0.10)] bg-white/[0.62] font-semibold hover:border-[rgba(15,23,42,0.22)]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <ReportFieldError>{error}</ReportFieldError> : null}
    </div>
  );
}
