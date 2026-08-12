"use client";

import { Text } from "@/components/Text";

export type CapaSegmentedControlProps = Readonly<{
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

/** Labeled segmented filter used on the CAPA dashboard toolbar. */
export function CapaSegmentedControl(
  props: Readonly<CapaSegmentedControlProps>,
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
          className="text-ehs-muted-text shrink-0 text-xs font-bold tracking-wide uppercase"
        >
          {label}
        </Text>
      </div>

      <div className="border-ehs-border/70 flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-xl border bg-white/80 p-2 shadow-xs backdrop-blur-xs">
        {options.map((option) => {
          const isActive = value === option;

          return (
            <button
              key={option}
              type="button"
              title={option}
              onClick={() => onChange(option)}
              className={[
                "flex min-w-max flex-1 cursor-pointer items-center justify-center rounded-md px-2.5 py-1 text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "bg-ehs-dark-bg text-ehs-light-text font-semibold shadow-xs"
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
