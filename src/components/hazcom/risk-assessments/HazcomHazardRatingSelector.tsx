"use client";

import { HAZCOM_FIELD_LABEL_CLASS } from "@/components/hazcom/shared/HazcomFormField";

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
      <span className={HAZCOM_FIELD_LABEL_CLASS}>{label}</span>
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
                "text5 flex size-8 items-center justify-center rounded-lg transition-colors",
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
      <span className="text8 text-ehs-muted-text">
        {`${value} – ${descriptor}`}
      </span>
    </div>
  );
}
