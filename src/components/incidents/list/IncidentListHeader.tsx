"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type IncidentListHeaderProps = Readonly<{
  title?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  dateRangeLabel?: string;
  onDateRangeClick?: () => void;
  onNotificationsClick?: () => void;
  hasUnreadNotifications?: boolean;
  /** Primary CTA href (incidents report, document upload, etc.). */
  reportHref?: string;
  /** Primary CTA label. Defaults to “Report incident”. */
  actionLabel?: string;
  /** Short label for small screens. Defaults to first word of actionLabel / “Report”. */
  actionLabelShort?: string;
  /** Hides the primary CTA button entirely (e.g. read-only register screens). */
  showAction?: boolean;
  /** Where the search field renders: next to the title ("start") or in the right-hand utility cluster ("end", default). */
  searchPosition?: "start" | "end";
  className?: string;
}>;

const controlClass =
  "border-ehs-border text-ehs-gray inline-flex min-w-0 shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-2 text-[13px] shadow-sm transition-colors hover:bg-ehs-light-bg sm:px-3.5";

const iconControlClass =
  "border-ehs-border relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm transition-colors hover:bg-ehs-light-bg";

export function IncidentListHeader(props: Readonly<IncidentListHeaderProps>) {
  const {
    title = "Incidents",
    searchPlaceholder = "Search incidents, actions, docs…",
    searchQuery = "",
    onSearchChange,
    dateRangeLabel = "March 25 — April 24, 2026",
    onDateRangeClick,
    onNotificationsClick,
    hasUnreadNotifications = true,
    reportHref = "/dashboard/incidents/report",
    actionLabel = "Report incident",
    actionLabelShort,
    showAction = true,
    searchPosition = "end",
    className = "",
  } = props;

  const shortLabel =
    actionLabelShort ?? actionLabel.split(/\s+/)[0] ?? "Report";

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const searchInput = (
    <div className="relative w-full min-w-0 sm:w-[220px] lg:w-[280px]">
      <Icon
        icon="mdi:magnify"
        className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
        aria-hidden="true"
      />
      <input
        ref={searchInputRef}
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange?.(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label="Search incidents"
        className="border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-lg border bg-white py-2 pr-12 pl-9 text-[13px] shadow-sm outline-none focus:ring-2"
      />
      <kbd className="border-ehs-border text-ehs-muted-text bg-ehs-light-bg pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border px-1.5 py-px text-[10px] font-medium sm:inline">
        ⌘K
      </kbd>
    </div>
  );

  return (
    <header
      className={[
        "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
        {title ? (
          <Text
            as="h1"
            className="text-ehs-darker shrink-0 text-2xl font-bold tracking-tight"
          >
            {title}
          </Text>
        ) : null}
        {searchPosition === "start" ? searchInput : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">
        {searchPosition === "end" ? searchInput : null}

        <button
          type="button"
          onClick={onDateRangeClick}
          className={controlClass}
        >
          <Icon
            icon="mdi:calendar-outline"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
          <span className="max-w-[140px] truncate whitespace-nowrap md:max-w-none">
            {dateRangeLabel}
          </span>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text hidden text-sm sm:inline"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          onClick={onNotificationsClick}
          className={iconControlClass}
        >
          <Icon
            icon="mdi:bell-outline"
            className="text-ehs-darker text-lg"
            aria-hidden="true"
          />
          {hasUnreadNotifications ? (
            <span
              className="bg-ehs-red border-ehs-light-text absolute top-2 right-2 h-1.5 w-1.5 rounded-full border"
              aria-hidden="true"
            />
          ) : null}
        </button>

        {showAction ? (
          <Link href={reportHref} className="min-w-0 sm:shrink-0">
            <Button
              type="button"
              variant="primary"
              className="w-full rounded-lg px-3 py-2 text-[13px] sm:w-auto sm:px-4"
            >
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{actionLabel}</span>
            </Button>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
