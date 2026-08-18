"use client";

import type { KeyboardEvent } from "react";
import {
  fromTimeParts,
  nowHhMm,
  toTimeParts,
  type Meridiem,
} from "@/components/incidents/report/shared/report-date-time";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
/** Five-minute steps. Exact minutes stay available by typing. */
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
const MERIDIEMS: readonly Meridiem[] = ["AM", "PM"];

export type ReportTimePopoverProps = Readonly<{
  /** Current `HH:MM`, or `""`. */
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}>;

const columnClass =
  "flex max-h-52 min-w-0 flex-1 flex-col gap-0.5 overflow-y-auto p-1";

function optionClass(isSelected: boolean): string {
  return [
    "cursor-pointer rounded-1.75 px-2 py-1.5 text-center text-3.25 transition-colors",
    isSelected
      ? "bg-ehs-normal-blue font-bold text-white"
      : "text-ehs-dark-bg hover:bg-ehs-light-bg",
  ].join(" ");
}

/**
 * Hour / minute / AM-PM picker for the time fields.
 *
 * Offered in 12-hour parts even though the field stores 24-hour, because that
 * is how the time of an incident gets said out loud — "about half two in the
 * afternoon". The field's own text entry stays the way to entre an exact
 * minute; this is the fast path, not the only path.
 *
 * Every click commits a complete time rather than a partial one: the parts not
 * being chosen come from the current value, or from the current hour when the
 * field is empty. So a single click can never leave a half-set time behind.
 */
export function ReportTimePopover(props: Readonly<ReportTimePopoverProps>) {
  const { value, onSelect, onClose } = props;

  const parts = toTimeParts(value);
  const hasValue = value.trim() !== "";

  function commit(next: Partial<typeof parts>) {
    onSelect(fromTimeParts({ ...parts, ...next }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  /** Scrolls the chosen row into view when the popover opens. */
  function revealIfSelected(node: HTMLButtonElement | null, selected: boolean) {
    if (node && selected) {
      node.scrollIntoView({ block: "center" });
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Choose a time"
      onKeyDown={onKeyDown}
      className="animate-popover-in rounded-3 absolute top-full left-1/2 z-40 mt-1.5 w-58 -translate-x-1/2 border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
    >
      <div className="flex divide-x divide-[rgba(15,23,42,0.08)]">
        <div className={columnClass} role="listbox" aria-label="Hour">
          {HOURS.map((hour) => {
            const isSelected = hasValue && hour === parts.hour12;
            return (
              <button
                key={hour}
                type="button"
                role="option"
                aria-selected={isSelected}
                ref={(node) => revealIfSelected(node, isSelected)}
                onClick={() => commit({ hour12: hour })}
                className={optionClass(isSelected)}
              >
                {hour}
              </button>
            );
          })}
        </div>

        <div className={columnClass} role="listbox" aria-label="Minute">
          {MINUTES.map((minute) => {
            const isSelected = hasValue && minute === parts.minute;
            return (
              <button
                key={minute}
                type="button"
                role="option"
                aria-selected={isSelected}
                ref={(node) => revealIfSelected(node, isSelected)}
                onClick={() => commit({ minute })}
                className={optionClass(isSelected)}
              >
                {String(minute).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <div
          className="flex min-w-0 flex-col gap-0.5 p-1"
          role="listbox"
          aria-label="AM or PM"
        >
          {MERIDIEMS.map((meridiem) => {
            const isSelected = hasValue && meridiem === parts.meridiem;
            return (
              <button
                key={meridiem}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => commit({ meridiem })}
                className={optionClass(isSelected)}
              >
                {meridiem}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[rgba(15,23,42,0.08)] px-2 py-1.5">
        <button
          type="button"
          onClick={() => onSelect(nowHhMm())}
          className="text-ehs-dark-blue hover:bg-ehs-light-bg cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-colors"
        >
          Now
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-ehs-gray hover:text-ehs-dark-bg cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
