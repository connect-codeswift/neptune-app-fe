"use client";

import { Icon } from "@iconify/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import {
  formatHeaderDateRangeLabel,
  getDefaultDateRange,
  getPresetDateRange,
  normalizeDateRange,
  type DateRange,
  type DateRangePreset,
} from "@/lib/date-range";

type CalendarValue = Date | null | [Date | null, Date | null];

export type HeaderDateRangePickerProps = Readonly<{
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  buttonClassName?: string;
  icon?: string;
}>;

const PRESETS: readonly { id: DateRangePreset; label: string }[] = [
  { id: "year_to_date", label: "Year to date" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "last_90_days", label: "Last 90 days" },
];

function toCalendarValue(range: DateRange): [Date, Date] {
  const normalized = normalizeDateRange(range);
  return [normalized.start, normalized.end];
}

function rangeFromCalendarValue(value: CalendarValue): DateRange | null {
  if (Array.isArray(value)) {
    const [start, end] = value;
    if (start && end) {
      return normalizeDateRange({ start, end });
    }
    return null;
  }

  if (value) {
    return normalizeDateRange({ start: value, end: value });
  }

  return null;
}

export function HeaderDateRangePicker(
  props: Readonly<HeaderDateRangePickerProps>,
) {
  const {
    value,
    onChange,
    buttonClassName = "",
    icon = "mdi:calendar-outline",
  } = props;

  const [internalRange, setInternalRange] = useState<DateRange>(() =>
    getDefaultDateRange(),
  );
  const activeRange = value ?? internalRange;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>(activeRange);
  const [draftCalendarValue, setDraftCalendarValue] = useState<CalendarValue>(
    () => toCalendarValue(activeRange),
  );
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function commitRange(next: DateRange) {
    const normalized = normalizeDateRange(next);
    if (onChange) {
      onChange(normalized);
    } else {
      setInternalRange(normalized);
    }
  }

  function openPopover() {
    setDraftRange(activeRange);
    setDraftCalendarValue(toCalendarValue(activeRange));
    setOpen(true);
  }

  function closePopover() {
    setOpen(false);
  }

  function applyDraft() {
    commitRange(draftRange);
    closePopover();
  }

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuWidth = menuRef.current?.offsetWidth ?? 320;
      const menuHeight = menuRef.current?.offsetHeight ?? 420;
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
      const top = openUpward
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );

      setMenuPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, draftRange, draftCalendarValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closePopover();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const popover =
    mounted && open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={popoverId}
            role="dialog"
            aria-label="Choose a date range"
            style={
              {
                top: menuPosition.top,
                left: menuPosition.left,
              } satisfies CSSProperties
            }
            className="fixed z-[120] w-[min(100vw-16px,320px)] overflow-hidden rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
          >
            <div className="flex flex-wrap gap-1.5 border-b border-[rgba(15,23,42,0.08)] p-2.5">
              {PRESETS.map((preset) => {
                const isActive =
                  formatHeaderDateRangeLabel(draftRange) ===
                  formatHeaderDateRangeLabel(getPresetDateRange(preset.id));

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      const next = getPresetDateRange(preset.id);
                      setDraftRange(next);
                      setDraftCalendarValue(toCalendarValue(next));
                    }}
                    className={[
                      "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      isActive
                        ? "bg-ehs-light-blue text-ehs-dark-blue"
                        : "text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-dark-bg border border-[rgba(15,23,42,0.1)]",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="header-date-range-calendar p-2.5">
              <Calendar
                selectRange
                value={draftCalendarValue}
                onChange={(nextValue) => {
                  setDraftCalendarValue(nextValue);
                  const nextRange = rangeFromCalendarValue(nextValue);
                  if (nextRange) {
                    setDraftRange(nextRange);
                  }
                }}
                maxDate={new Date()}
                className="w-full border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[rgba(15,23,42,0.08)] px-2.5 py-2">
              <Button
                type="button"
                variant="tertiary"
                onClick={closePopover}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={applyDraft}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                Apply
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) {
            closePopover();
          } else {
            openPopover();
          }
        }}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        className={buttonClassName}
      >
        <Icon
          icon={icon}
          className="text-ehs-muted-text text-sm"
          aria-hidden="true"
        />
        <span className="max-w-[140px] truncate whitespace-nowrap md:max-w-none">
          {formatHeaderDateRangeLabel(activeRange)}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className="text-ehs-muted-text hidden text-sm sm:inline"
          aria-hidden="true"
        />
      </button>

      {popover}

      <style jsx global>{`
        .header-date-range-calendar .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }

        .header-date-range-calendar .react-calendar__navigation {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .header-date-range-calendar .react-calendar__navigation button {
          min-width: 1.75rem;
          background: none;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--ehs-dark-bg, #0b1320);
          border-radius: 0.5rem;
        }

        .header-date-range-calendar
          .react-calendar__navigation
          button:enabled:hover,
        .header-date-range-calendar
          .react-calendar__navigation
          button:enabled:focus {
          background: rgba(15, 23, 42, 0.04);
        }

        .header-date-range-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--ehs-muted-text, #8892a3);
        }

        .header-date-range-calendar .react-calendar__month-view__weekdays__abbr {
          text-decoration: none;
        }

        .header-date-range-calendar .react-calendar__tile {
          padding: 0.5rem 0.25rem;
          font-size: 0.75rem;
          border-radius: 0.5rem;
        }

        .header-date-range-calendar .react-calendar__tile:enabled:hover,
        .header-date-range-calendar .react-calendar__tile:enabled:focus {
          background: rgba(15, 23, 42, 0.04);
        }

        .header-date-range-calendar .react-calendar__tile--active,
        .header-date-range-calendar .react-calendar__tile--rangeStart,
        .header-date-range-calendar .react-calendar__tile--rangeEnd,
        .header-date-range-calendar .react-calendar__tile--rangeBothEnds {
          background: var(--ehs-normal-blue, #0891a6) !important;
          color: white;
        }

        .header-date-range-calendar .react-calendar__tile--range {
          background: rgba(8, 145, 166, 0.12);
          color: var(--ehs-dark-bg, #0b1320);
        }
      `}</style>
    </div>
  );
}
