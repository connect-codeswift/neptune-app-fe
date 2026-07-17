"use client";

import { Icon } from "@iconify/react";

export type ReportIncidentToolbarProps = Readonly<{
  searchPlaceholder?: string;
  dateRangeLabel?: string;
  className?: string;
}>;

export function ReportIncidentToolbar(
  props: Readonly<ReportIncidentToolbarProps>,
) {
  const {
    searchPlaceholder = "Search incidents, actions, docs…",
    dateRangeLabel = "March 25 — April 24, 2026",
    className = "",
  } = props;

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-3 px-0 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full max-w-[280px] min-w-0">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-lg border bg-white py-2 pr-12 pl-9 text-[13px] shadow-sm outline-none focus:ring-2"
        />
        <kbd className="border-ehs-border text-ehs-muted-text bg-ehs-light-bg pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border px-1.5 py-px text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="border-ehs-border text-ehs-gray inline-flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-[13px] shadow-sm"
        >
          <Icon
            icon="mdi:calendar-outline"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{dateRangeLabel}</span>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="border-ehs-border relative inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white shadow-sm"
        >
          <Icon
            icon="mdi:bell-outline"
            className="text-ehs-darker text-lg"
            aria-hidden="true"
          />
          <span
            className="bg-ehs-red border-ehs-light-text absolute top-2 right-2 h-1.5 w-1.5 rounded-full border"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
