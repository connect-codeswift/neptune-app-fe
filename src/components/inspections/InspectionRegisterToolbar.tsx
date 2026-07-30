"use client";

import { Button } from "@/components/ui/Button";

export type InspectionRegisterToolbarProps = Readonly<{
  status: string;
  /** Segment options, derived from the statuses present in the data. */
  statuses: readonly string[];
  onStatusChange: (value: string) => void;
  onTemplatesClick?: () => void;
}>;

/** Card header for the inspection register: title, status segments, Templates. */
export function InspectionRegisterToolbar(
  props: InspectionRegisterToolbarProps,
) {
  const { status, statuses, onStatusChange, onTemplatesClick } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-ehs-dark-bg shrink-0 font-bold">
        Inspection register
      </h3>

      <div className="flex flex-wrap items-center gap-3">
        <div className="border-ehs-border flex flex-wrap items-center gap-2 rounded-xl border bg-white px-2.5 py-1">
          {statuses.map((option) => {
            const isActive = status === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onStatusChange(option)}
                className={[
                  "cursor-pointer rounded-md px-2.5 py-1 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-ehs-dark-bg text-ehs-light-text"
                    : "text-ehs-gray hover:bg-black/5",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={onTemplatesClick}
          className="shrink-0 rounded-lg px-5 py-2 text-sm font-semibold"
        >
          Templates
        </Button>
      </div>
    </div>
  );
}
