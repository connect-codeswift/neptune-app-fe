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
        "flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex shrink-0 items-center py-px">
        <Text
          as="span"
          className="text-ehs-muted-text shrink-0 text-[10px] font-bold tracking-[0.8px] uppercase sm:text-[11px]"
        >
          {label}
        </Text>
      </div>

      <div className="border-ehs-border/70 flex min-w-0 flex-1 items-center gap-0.5 rounded-xl border bg-white/80 p-1 shadow-xs backdrop-blur-xs">
        {options.map((option) => {
          const isActive = value === option;

          return (
            <button
              key={option}
              type="button"
              title={option}
              onClick={() => onChange(option)}
              className={[
                "flex min-w-max flex-1 cursor-pointer items-center justify-center rounded-lg px-2.5 py-1.5 text-center text-[11px] font-semibold whitespace-nowrap transition-all duration-150 sm:text-[11.5px]",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-text font-bold shadow-xs"
                  : "text-ehs-gray hover:text-ehs-darker hover:bg-black/5",
              ].join(" ")}
            >
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
