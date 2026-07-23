"use client";

export type CapaSegmentedToggleProps = Readonly<{
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}>;

export function CapaSegmentedToggle(props: Readonly<CapaSegmentedToggleProps>) {
  const { options, value, onChange, ariaLabel, className = "" } = props;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "flex w-full items-stretch rounded-[10px] bg-white p-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={[
              "flex min-w-0 flex-1 items-center justify-center rounded-[6px] py-1.5 text-[14px] leading-5 whitespace-nowrap transition-colors",
              isActive
                ? "bg-[#06939b] text-white"
                : "text-[#64748b] hover:bg-[#06939b]/10",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
