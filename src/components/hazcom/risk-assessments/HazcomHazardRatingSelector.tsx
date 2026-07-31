"use client";

const RATING_VALUES = [0, 1, 2, 3, 4] as const;
const RATING_DESCRIPTORS = [
  "None",
  "Slight",
  "Moderate",
  "Serious",
  "Severe",
] as const;

export type HazcomHazardRatingSelectorProps = Readonly<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}>;

export function HazcomHazardRatingSelector(
  props: Readonly<HazcomHazardRatingSelectorProps>,
) {
  const { label, value, onChange, className = "" } = props;
  const descriptor = RATING_DESCRIPTORS[value] ?? "None";

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <span className="text-[12px] font-bold text-[#2a3446]">{label}</span>
      <div className="flex gap-1.5">
        {RATING_VALUES.map((rating) => {
          const selected = rating === value;

          return (
            <button
              key={rating}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(rating)}
              className={[
                "flex size-8 items-center justify-center rounded-lg text-[13px] font-bold transition-colors",
                selected
                  ? "bg-ehs-normal-blue text-ehs-light-text"
                  : "bg-ehs-dark-bg/10 text-ehs-gray hover:bg-ehs-dark-bg/16",
              ].join(" ")}
            >
              {rating}
            </button>
          );
        })}
      </div>
      <span className="text-ehs-muted-text text-[10.5px]">
        {`${value} – ${descriptor}`}
      </span>
    </div>
  );
}
