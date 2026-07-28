"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { CalendarEventItem } from "../regulatory-compliance-types";

export type RegulatoryComplianceCalendarGridProps = Readonly<{
  events: readonly CalendarEventItem[];
  className?: string;
}>;

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function RegulatoryComplianceCalendarGrid(
  props: RegulatoryComplianceCalendarGridProps,
) {
  const { events, className = "" } = props;

  // Default to March 16, 2025 as shown in the screenshot
  const [selectedDate, setSelectedDate] = useState<Value>(
    new Date(2025, 2, 16),
  );

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayNum = date.getDate();
    const isMarch2025 = date.getMonth() === 2 && date.getFullYear() === 2025;

    if (!isMarch2025) return null;

    const dayEvents = events.filter((e) => e.day === dayNum);
    const hasMore = dayNum === 1; // Match screenshot "+2 more" badge on Day 1

    if (dayEvents.length === 0 && !hasMore) return null;

    return (
      <div className="mt-1 flex w-full flex-col gap-1">
        {dayEvents.map((evt) => (
          <span
            key={evt.id}
            className={[
              "inline-block w-full truncate rounded-md px-2 py-0.5 text-left text-[10px] leading-normal font-semibold",
              evt.chipTone === "pink"
                ? "bg-[#fee2e2] text-[#ef4444]"
                : "bg-[#d2eff4] text-[#008ba3]",
            ].join(" ")}
            title={evt.title}
          >
            {evt.title}
          </span>
        ))}
        {hasMore && (
          <span className="pt-0.5 pl-0.5 text-left text-[10px] font-semibold text-[#64748b]">
            +2 more
          </span>
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";
    const isMarch16 =
      date.getDate() === 16 &&
      date.getMonth() === 2 &&
      date.getFullYear() === 2025;

    if (isMarch16) {
      return "is-selected-day";
    }
    return "";
  };

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[20px] border border-white/90 bg-white/70 p-6 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md",
        className,
      ]
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
          color: #64748b;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        .custom-react-calendar .react-calendar__navigation button:enabled:hover,
        .custom-react-calendar
          .react-calendar__navigation
          button:enabled:focus {
          background-color: rgba(226, 232, 240, 0.6) !important;
          color: #0f172a !important;
        }
        .custom-react-calendar .react-calendar__navigation__label {
          font-weight: 700 !important;
          font-size: 1rem !important;
          color: #0f172a !important;
          pointer-events: none;
        }
        .custom-react-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: #94a3b8;
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
          color: #64748b !important;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .custom-react-calendar .react-calendar__tile:enabled:hover,
        .custom-react-calendar .react-calendar__tile:enabled:focus {
          background-color: #ffffff !important;
        }
        .custom-react-calendar .react-calendar__tile--active,
        .custom-react-calendar .react-calendar__tile.is-selected-day {
          background-color: #e6f4f9 !important;
          border-color: rgba(8, 145, 166, 0.4) !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        .custom-react-calendar
          .react-calendar__month-view__days__day--neighboringMonth {
          opacity: 0.3;
        }
      `}</style>

      <Calendar
        className="custom-react-calendar"
        value={selectedDate}
        onChange={setSelectedDate}
        defaultActiveStartDate={new Date(2025, 2, 1)}
        tileContent={tileContent}
        tileClassName={tileClassName}
        formatShortWeekday={(_, date) =>
          date.toLocaleDateString("en-US", { weekday: "short" })
        }
      />
    </div>
  );
}
