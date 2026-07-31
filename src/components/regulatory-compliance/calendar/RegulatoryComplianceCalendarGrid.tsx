"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { IncidentGlassCard, IncidentBadge } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { CalendarEventItem } from "../regulatory-compliance-types";

export type RegulatoryComplianceCalendarGridProps = Readonly<{
  events: readonly CalendarEventItem[];
  activeStartDate: Date;
  onActiveStartDateChange: (date: Date) => void;
  className?: string;
}>;

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const MAX_VISIBLE_EVENTS = 2;

export function RegulatoryComplianceCalendarGrid(
  props: RegulatoryComplianceCalendarGridProps,
) {
  const {
    events,
    activeStartDate,
    onActiveStartDateChange,
    className = "",
  } = props;

  const [selectedDate, setSelectedDate] = useState<Value>(new Date());

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayEvents = events.filter((e) => e.day === date.getDate());
    if (dayEvents.length === 0) return null;

    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const overflowCount = dayEvents.length - visibleEvents.length;

    return (
      <div className="mt-1 flex w-full flex-col gap-1">
        {visibleEvents.map((evt) => (
          <IncidentBadge
            key={evt.id}
            label={evt.title}
            tone={evt.chipTone === "pink" ? "danger" : "teal"}
            className="block w-full truncate text-left"
          />
        ))}
        {overflowCount > 0 ? (
          <Text
            as="span"
            className="text-ehs-gray pt-0.5 pl-0.5 text-left text-[10px] font-semibold"
          >
            {`+${String(overflowCount)} more`}
          </Text>
        ) : null}
      </div>
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
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]", className]
        .filter(Boolean)
        .join(" ")}
    >
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
          font-size: 1rem;
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
          font-weight: 700 !important;
          font-size: 1rem !important;
          color: var(--ehs-dark-bg) !important;
          pointer-events: none;
        }
        .custom-react-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ehs-muted-text);
          text-transform: none;
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
          min-height: 105px;
          padding: 0.5rem !important;
          border-radius: 0.75rem !important;
          border: 1px solid rgba(15, 23, 42, 0.04) !important;
          background-color: rgba(255, 255, 255, 0.6) !important;
          text-align: left !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          color: var(--ehs-gray) !important;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .custom-react-calendar .react-calendar__tile:enabled:hover,
        .custom-react-calendar .react-calendar__tile:enabled:focus {
          background-color: var(--ehs-light-text) !important;
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
