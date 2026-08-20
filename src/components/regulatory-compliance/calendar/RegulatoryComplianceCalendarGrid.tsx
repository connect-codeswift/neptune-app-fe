"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import type { CalendarEventItem } from "../regulatory-compliance-types";

export type RegulatoryComplianceCalendarGridProps = Readonly<{
  events: readonly CalendarEventItem[];
  activeStartDate: Date;
  onActiveStartDateChange: (date: Date) => void;
  isLoading?: boolean;
  className?: string;
}>;

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type DayHoverState = Readonly<{
  dateKey: string;
  heading: string;
  events: readonly CalendarEventItem[];
  top: number;
  left: number;
}>;

const MAX_VISIBLE_EVENTS = 2;
const EVENT_TITLE_MAX_CHARS = 15;
const PANEL_WIDTH = 280;
const PANEL_GAP = 8;
const CLOSE_DELAY_MS = 120;

function dateKey(date: Date): string {
  return `${String(date.getFullYear())}-${String(date.getMonth())}-${String(date.getDate())}`;
}

function truncateEventTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= EVENT_TITLE_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, EVENT_TITLE_MAX_CHARS)}…`;
}

function eventsForDate(
  events: readonly CalendarEventItem[],
  date: Date,
): readonly CalendarEventItem[] {
  return events.filter(
    (event) =>
      event.day === date.getDate() &&
      event.month === date.getMonth() &&
      event.year === date.getFullYear(),
  );
}

function positionPanel(tile: HTMLElement): { top: number; left: number } {
  const rect = tile.getBoundingClientRect();
  const maxLeft = window.innerWidth - PANEL_WIDTH - PANEL_GAP;
  const preferRight = rect.right + PANEL_GAP;
  const left =
    preferRight <= maxLeft
      ? preferRight
      : Math.max(PANEL_GAP, rect.left - PANEL_WIDTH - PANEL_GAP);
  const top = Math.min(
    Math.max(PANEL_GAP, rect.top),
    window.innerHeight - PANEL_GAP,
  );

  return { top, left };
}

function DayTasksPanel(
  props: Readonly<{
    state: DayHoverState;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }>,
) {
  const { state, onMouseEnter, onMouseLeave } = props;

  return createPortal(
    <div
      role="dialog"
      aria-label={`Tasks for ${state.heading}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="border-ehs-border bg-ehs-surface fixed z-100 flex max-h-[min(320px,70vh)] w-70 flex-col overflow-hidden rounded-xl border shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.22)]"
      style={{ top: state.top, left: state.left }}
    >
      <div className="border-ehs-border shrink-0 border-b px-3 py-2.5">
        <Text as="p" className="text3 text-ehs-darker">
          {state.heading}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {state.events.length === 1
            ? "1 obligation"
            : `${String(state.events.length)} obligations`}
        </Text>
      </div>

      <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {state.events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/dashboard/regulatory-compliance/${encodeURIComponent(event.id)}`}
              className="hover:bg-ehs-light-bg flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors"
            >
              <span
                className={[
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  event.chipTone === "pink"
                    ? "bg-ehs-red"
                    : "bg-ehs-normal-blue",
                ].join(" ")}
                aria-hidden
              />
              <Text
                as="span"
                className="text4 text-ehs-darker text-left wrap-break-word"
              >
                {event.title}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}

export function RegulatoryComplianceCalendarGrid(
  props: RegulatoryComplianceCalendarGridProps,
) {
  const {
    events,
    activeStartDate,
    onActiveStartDateChange,
    isLoading = false,
    className = "",
  } = props;

  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [hoveredDay, setHoveredDay] = useState<DayHoverState | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setHoveredDay(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  };

  const showDayPanel = (
    date: Date,
    dayEvents: readonly CalendarEventItem[],
    tile: HTMLElement,
  ) => {
    clearCloseTimer();
    const { top, left } = positionPanel(tile);
    setHoveredDay({
      dateKey: dateKey(date),
      heading: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      events: dayEvents,
      top,
      left,
    });
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayEvents = eventsForDate(events, date);
    if (dayEvents.length === 0) return null;

    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const overflowCount = dayEvents.length - visibleEvents.length;

    return (
      <>
        <div
          className="absolute inset-0 z-1"
          onMouseEnter={(event) => {
            const tile = event.currentTarget.parentElement;
            if (!(tile instanceof HTMLElement)) return;
            showDayPanel(date, dayEvents, tile);
          }}
          onMouseLeave={scheduleClose}
          aria-hidden
        />
        <div className="pointer-events-none relative z-2 mt-1 flex w-full flex-col gap-1">
          {visibleEvents.map((evt) => (
            <span key={evt.id} className="block w-full min-w-0">
              <IncidentBadge
                label={truncateEventTitle(evt.title)}
                tone={evt.chipTone === "pink" ? "danger" : "teal"}
                className="text8 block w-full truncate px-1.5 py-0 text-left tracking-normal"
              />
            </span>
          ))}
          {overflowCount > 0 ? (
            <Text
              as="span"
              className="text7 text-ehs-gray pt-0.5 pl-0.5 text-left"
            >
              {`+${String(overflowCount)} more`}
            </Text>
          ) : null}
        </div>
      </>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return isToday ? "is-selected-day" : "";
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["backdrop-blur-2.5 bg-ehs-surface/62 relative", className]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        <div className="rounded-5 backdrop-blur-0.25 bg-ehs-surface/45 pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Text as="span" className="text8 text-ehs-muted-text">
            Loading calendar…
          </Text>
        </div>
      ) : null}

      {hoveredDay ? (
        <DayTasksPanel
          state={hoveredDay}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        />
      ) : null}

      <style jsx global>{`
        .custom-react-calendar {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .custom-react-calendar .react-calendar__navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          height: auto;
        }
        .custom-react-calendar .react-calendar__navigation button {
          min-width: 36px;
          height: 36px;
          background: transparent;
          /* text4 */
          font-size: 0.875rem;
          font-weight: 400;
          line-height: normal;
          color: var(--ehs-gray);
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        .custom-react-calendar .react-calendar__navigation button:enabled:hover,
        .custom-react-calendar
          .react-calendar__navigation
          button:enabled:focus {
          background-color: color-mix(
            in srgb,
            var(--ehs-border) 60%,
            transparent
          ) !important;
          color: var(--ehs-dark-bg) !important;
        }
        .custom-react-calendar .react-calendar__navigation__label {
          /* text3 */
          font-weight: 700 !important;
          font-size: 1.125rem !important;
          line-height: 1.75rem !important;
          color: var(--ehs-dark-bg) !important;
          pointer-events: none;
        }
        .custom-react-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          /* text6 */
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1rem;
          letter-spacing: 0.025em;
          color: var(--ehs-muted-text);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .custom-react-calendar
          .react-calendar__month-view__weekdays__weekday
          abbr {
          text-decoration: none;
        }
        .custom-react-calendar .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 0.5rem !important;
        }
        .custom-react-calendar .react-calendar__tile {
          position: relative !important;
          min-height: 105px;
          padding: 0.5rem !important;
          border-radius: 0.75rem !important;
          border: 1px solid var(--ehs-border) !important;
          background-color: color-mix(
            in oklab,
            var(--ehs-surface) 60%,
            transparent
          ) !important;
          text-align: left !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          /* text8 */
          font-size: 0.75rem !important;
          font-weight: 400 !important;
          line-height: 1rem !important;
          color: var(--ehs-gray) !important;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .custom-react-calendar .react-calendar__tile:enabled:hover,
        .custom-react-calendar .react-calendar__tile:enabled:focus {
          /* --ehs-surface-raised, not --ehs-light-text: the latter is white in
             both themes (it is the ink for filled buttons), so hovering a day
             used to flash a white tile in dark mode. */
          background-color: var(--ehs-surface-raised) !important;
        }
        .custom-react-calendar .react-calendar__tile--active,
        .custom-react-calendar .react-calendar__tile.is-selected-day {
          background-color: var(--ehs-light-blue) !important;
          border-color: color-mix(
            in srgb,
            var(--ehs-normal-blue) 40%,
            transparent
          ) !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        .custom-react-calendar
          .react-calendar__month-view__days__day--neighboringMonth {
          opacity: 0.3;
        }
      `}</style>

      <Calendar
        className="custom-react-calendar"
        locale="en-US"
        value={selectedDate}
        onChange={setSelectedDate}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate: nextDate }) => {
          if (nextDate) {
            clearCloseTimer();
            setHoveredDay(null);
            onActiveStartDateChange(nextDate);
          }
        }}
        tileContent={tileContent}
        tileClassName={tileClassName}
        formatShortWeekday={(_, date) =>
          date.toLocaleDateString("en-US", { weekday: "short" })
        }
        prev2Label={null}
        next2Label={null}
      />
    </IncidentGlassCard>
  );
}
