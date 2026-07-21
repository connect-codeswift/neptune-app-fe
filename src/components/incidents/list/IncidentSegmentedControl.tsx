"use client";

import { Text } from "@/components/Text";

export type IncidentSegmentedControlProps = Readonly<{
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

export function IncidentSegmentedControl(
  props: Readonly<IncidentSegmentedControlProps>,
) {
  const { label, options, value, onChange, className = "" } = props;

  return (
    <div
      className={[
        "flex w-full min-w-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex shrink-0 items-center py-px">
        <Text
          as="span"
          className="text-ehs-muted-text text-[10.5px] font-bold tracking-[0.8px] uppercase sm:text-[11px]"
        >
          {label}
        </Text>
      </div>

      <div className="flex w-full min-w-0 flex-1 items-stretch gap-[2px] rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white/[0.62] p-[3px]">
        {options.map((option) => {
          const isActive = value === option;

          return (
            <button
              key={option}
              type="button"
              title={option}
              onClick={() => onChange(option)}
              className={[
                "flex min-w-0 flex-1 shrink-0 items-center justify-center truncate rounded-[6px] px-2 py-[6px] text-center text-[11px] font-bold whitespace-nowrap transition-all sm:px-2.5 sm:py-[7px] sm:text-[11.5px]",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-bg shadow-sm"
                  : "text-ehs-gray hover:bg-white/80",
              ].join(" ")}
            >
              <span className="truncate">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
