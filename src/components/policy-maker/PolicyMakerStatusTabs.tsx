"use client";

import type { DocumentStatusFilter } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerStatusTabsProps = Readonly<{
  options: readonly DocumentStatusFilter[];
  value: DocumentStatusFilter;
  onChange: (value: DocumentStatusFilter) => void;
  className?: string;
}>;

/** Compact segmented filter — same interaction model as IncidentSegmentedControl. */
export function PolicyMakerStatusTabs(
  props: Readonly<PolicyMakerStatusTabsProps>,
) {
  const { options, value, onChange, className = "" } = props;

  return (
    <div
      className={[
        "flex items-start gap-[1.95px] rounded-[7.78px] border-[0.97px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[2.92px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              "cursor-pointer rounded-[5.84px] px-[9.73px] py-[4.87px] text-[10px] font-bold whitespace-nowrap transition-colors",
              isActive
                ? "bg-[#0b1320] text-[#f3f5f8]"
                : "text-[#566072] hover:bg-black/5",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
