"use client";

import { Text } from "@/components/Text";

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
  className?: string;
}>;

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
    className = "",
  } = props;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-end gap-1.5">
        <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
          {label}
        </Text>
        {required ? (
          <Text as="span" className="text-ehs-red text-[12px]">
            *
          </Text>
        ) : null}
        {trailingHint ? (
          <Text
            as="span"
            className="text-ehs-muted-text ml-auto text-[9.8px]"
          >
            {trailingHint}
          </Text>
        ) : null}
      </div>

      <div
        className={
          variant === "tile"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            : "flex flex-wrap gap-[11px]"
        }
        role="radiogroup"
        aria-label={ariaLabel ?? label}
      >
        {options.map((option) => {
          const isSelected = option.id === value;
          const titleLines = option.lines ?? [option.label];

          if (variant === "tile") {
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(option.id)}
                className={[
                  "flex min-h-[57px] flex-col items-start gap-0.5 rounded-[10px] border p-[13px] text-left transition-all duration-200",
                  isSelected
                    ? "border-ehs-normal-blue bg-ehs-normal-blue/18 shadow-[0_0_0_1px_rgba(8,145,166,0.12)]"
                    : "border-[rgba(15,23,42,0.08)] bg-white/62 hover:border-[rgba(15,23,42,0.16)] hover:bg-white/80",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[12.8px] leading-normal font-bold",
                    isSelected ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                  ].join(" ")}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-ehs-muted-text text-[11px] leading-normal">
                    {option.description}
                  </span>
                ) : null}
              </button>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              className={[
                "flex h-[67px] w-[96px] min-w-[96px] flex-col items-start gap-1.5 rounded-[10px] border px-[13px] py-[11px] text-left transition-all duration-200",
                isSelected
                  ? "border-[#0891a6] bg-[rgba(8,145,166,0.14)] shadow-[0_0_0_1px_rgba(8,145,166,0.08)]"
                  : "border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] hover:border-[rgba(15,23,42,0.18)] hover:bg-white/80",
              ].join(" ")}
            >
              <span
                className={[
                  "size-2 shrink-0 rounded-[4px] transition-colors",
                  isSelected ? "bg-[#0891a6]" : "bg-[#566072]",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[12.5px] leading-[15px] font-bold",
                  isSelected ? "text-[#0891a6]" : "text-[#0b1320]",
                ].join(" ")}
              >
                {titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
