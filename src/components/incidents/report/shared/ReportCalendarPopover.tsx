"use client";

import { useState, type KeyboardEvent } from "react";
import { Icon } from "@iconify/react";
import {
  addDays,
  isSameDay,
  startOfDay,
  today,
} from "@/components/incidents/report/shared/report-date-time";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type ReportCalendarPopoverProps = Readonly<{
  /** Currently selected day, or `null` when the field is empty. */
  value: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  /** Inclusive bounds. Days outside them render disabled and can't be picked. */
  minDate?: Date | null;
  maxDate?: Date | null;
  labelledBy?: string;
  className?: string;
}>;

/**
 * The month grid behind the date fields.
 *
 * Purpose-built rather than `react-calendar` (which the compliance page uses):
 * that one is styled for 105px tiles in a full-page grid, and squeezing it into
 * a 260px popover meant a second stack of `!important` overrides fighting the
 * first. This also gets `minDate` / `maxDate` for free, which is what stops an
 * incident being dated next Tuesday.
 */
export function ReportCalendarPopover(
  props: Readonly<ReportCalendarPopoverProps>,
) {
  const { value, onSelect, onClose, minDate, maxDate, labelledBy, className } =
    props;

  const todayDate = today();
  const initialFocus = value ?? clampToRange(todayDate, minDate, maxDate);
  const [focusedDate, setFocusedDate] = useState(initialFocus);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialFocus.getFullYear(), initialFocus.getMonth(), 1),
  );

  function isDisabled(date: Date): boolean {
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    return false;
  }

  function moveFocus(nextDate: Date) {
    setFocusedDate(nextDate);
    if (
      nextDate.getMonth() !== visibleMonth.getMonth() ||
      nextDate.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    }
  }

  function shiftMonth(delta: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key in moves) {
      event.preventDefault();
      moveFocus(addDays(focusedDate, moves[event.key]!));
      return;
    }

    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const delta = event.key === "PageUp" ? -1 : 1;
      const next = new Date(focusedDate);
      next.setMonth(next.getMonth() + delta);
      moveFocus(next);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isDisabled(focusedDate)) {
        onSelect(focusedDate);
      }
    }
  }

  // Six rows always, so the popover doesn't change height as months change —
  // a grid that jumps under the cursor is how you mis-click a date.
  const gridStart = addDays(
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    -new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay(),
  );
  const days = Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index),
  );

  const prevDisabled = Boolean(
    minDate &&
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0) <
      startOfDay(minDate),
  );
  const nextDisabled = Boolean(
    maxDate &&
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1) >
      startOfDay(maxDate),
  );

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={labelledBy ? undefined : "Choose a date"}
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      // Centred on the field rather than edge-aligned: these sit in a
      // three-column grid, so anchoring left would push the last column's
      // popover off the card and anchoring right would do the same to the
      // first. Centring keeps all three inside it.
      className={
        className ??
        "animate-popover-in rounded-3 absolute top-full left-1/2 z-40 mt-1.5 w-65 -translate-x-1/2 border border-[rgba(15,23,42,0.1)] bg-white p-2.5 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
      }
    >
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
          className="text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-dark-bg inline-flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Icon icon="mdi:chevron-left" className="size-4" aria-hidden="true" />
        </button>

        <span
          aria-live="polite"
          className="text-ehs-dark-bg text-3.25 font-bold"
        >
          {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </span>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={nextDisabled}
          aria-label="Next month"
          className="text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-dark-bg inline-flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Icon
            icon="mdi:chevron-right"
            className="size-4"
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 pb-1">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            aria-hidden="true"
            className="text-ehs-muted-text text-2.5 flex h-6 items-center justify-center font-semibold"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div role="grid" className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isSelected = value ? isSameDay(day, value) : false;
          const isToday = isSameDay(day, todayDate);
          const disabled = isDisabled(day);
          const isFocused = isSameDay(day, focusedDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              role="gridcell"
              // One tab stop for the whole grid — arrow keys move within it,
              // rather than Tab walking all 42 cells.
              tabIndex={isFocused ? 0 : -1}
              ref={(node) => {
                if (isFocused) node?.focus({ preventScroll: true });
              }}
              disabled={disabled}
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={day.toDateString()}
              onClick={() => onSelect(day)}
              // Guarded: `day` is a fresh Date every render, so an unguarded
              // set would never compare equal and would re-render on the very
              // focus it just caused.
              onFocus={() => {
                if (!isSameDay(day, focusedDate)) setFocusedDate(day);
              }}
              className={[
                "relative flex h-8 cursor-pointer items-center justify-center rounded-lg text-[13px] transition-colors",
                "focus-visible:ring-ehs-normal-blue/40 focus-visible:ring-2 focus-visible:outline-none",
                disabled
                  ? "cursor-not-allowed text-[rgba(15,23,42,0.22)]"
                  : isSelected
                    ? "bg-ehs-normal-blue font-bold text-white"
                    : isCurrentMonth
                      ? "text-ehs-dark-bg hover:bg-ehs-light-bg font-medium"
                      : "text-ehs-muted-text hover:bg-ehs-light-bg",
              ].join(" ")}
            >
              {day.getDate()}
              {isToday && !isSelected ? (
                <span
                  className="bg-ehs-normal-blue absolute bottom-1 size-1 rounded-full"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function clampToRange(
  date: Date,
  minDate?: Date | null,
  maxDate?: Date | null,
): Date {
  if (minDate && date < startOfDay(minDate)) return startOfDay(minDate);
  if (maxDate && date > startOfDay(maxDate)) return startOfDay(maxDate);
  return date;
}
