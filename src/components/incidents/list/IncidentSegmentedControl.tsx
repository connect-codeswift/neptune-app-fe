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
      <div className="flex shrink-0 flex-col items-start py-px">
        <Text
          as="span"
          className="text-ehs-muted-text text-[11px] font-bold tracking-[0.8px] uppercase"
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
              onClick={() => onChange(option)}
              className={[
                "flex min-w-0 flex-1 items-center justify-center rounded-[6px] px-3 py-[7px] text-center text-[12px] font-bold whitespace-nowrap transition-colors",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-bg"
                  : "text-ehs-gray hover:bg-white/80",
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
