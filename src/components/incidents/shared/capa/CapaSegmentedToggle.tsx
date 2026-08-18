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
        "rounded-2.5 flex w-full items-stretch bg-white p-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
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
              "rounded-1.5 flex min-w-0 flex-1 items-center justify-center py-1.5 text-sm leading-5 whitespace-nowrap transition-colors",
              isActive
                ? "bg-ehs-normal-blue text-ehs-light-text"
                : "text-ehs-gray hover:bg-ehs-normal-blue/10",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
