"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type CompliancePageHeaderProps = Readonly<{
  dateRangeLabel?: string;
  hasUnreadNotifications?: boolean;
  onDateRangeClick?: () => void;
  onNotificationsClick?: () => void;
  /** When false, hides the page title (e.g. add-obligation form). */
  showTitle?: boolean;
  /** When false, omits the calendar icon from the date-range control. */
  showDateRangeCalendarIcon?: boolean;
  className?: string;
}>;

export function CompliancePageHeader(props: CompliancePageHeaderProps) {
  const {
    dateRangeLabel = "March 25 — April 24, 2026",
    hasUnreadNotifications = true,
    onDateRangeClick,
    onNotificationsClick,
    showTitle = true,
    showDateRangeCalendarIcon = true,
    className = "",
  } = props;

  const searchField = (
    <div className="relative h-[35px] w-[280px] max-w-full shrink-0 overflow-hidden rounded-[9.73px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] backdrop-blur-[5px]">
      <Icon
        icon="mdi:magnify"
        className="pointer-events-none absolute top-1/2 left-3 size-[14.595px] -translate-y-1/2 text-[#8892a3]"
        aria-hidden
      />
      <input
        type="search"
        readOnly
        tabIndex={-1}
        placeholder="Search incidents, actions, docs…"
        aria-hidden
        className="h-full w-full cursor-default bg-transparent pr-[42px] pl-[33px] text-[12px] text-[#0b1320] outline-none placeholder:text-[#8892a3]"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 flex h-[19.459px] min-w-[30.622px] -translate-y-1/2 items-center justify-center rounded-[3.892px] border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.62)] px-1.5 text-[10px] font-normal text-[#566072]">
        ⌘K
      </kbd>
    </div>
  );

  const utilityCluster = (
    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-[14px]">
      {showTitle ? searchField : null}

      <button
        type="button"
        onClick={onDateRangeClick}
        className="inline-flex h-[35.432px] shrink-0 items-center gap-2 rounded-[9.73px] border border-white/90 bg-[rgba(255,255,255,0.62)] px-[13.62px] backdrop-blur-[6px] transition-colors hover:bg-white/80"
      >
        {showDateRangeCalendarIcon ? (
          <Icon
            icon="mdi:calendar-outline"
            className="size-[14.595px] text-[#8892a3]"
            aria-hidden
          />
        ) : null}
        <span className="max-w-[157px] truncate text-[12px] leading-none font-bold text-[#0b1320] sm:max-w-none">
          {dateRangeLabel}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className="hidden size-[12.649px] text-[#8892a3] sm:inline"
          aria-hidden
        />
      </button>

      <button
        type="button"
        aria-label="Notifications"
        onClick={onNotificationsClick}
        className="relative inline-flex h-[33.081px] w-[36.973px] shrink-0 items-center justify-center rounded-[9.73px] border border-white/90 bg-[rgba(255,255,255,0.62)] backdrop-blur-[6px] transition-colors hover:bg-white/80"
      >
        <Icon
          icon="mdi:bell-outline"
          className="size-[15.568px] text-[#0b1320]"
          aria-hidden
        />
        {hasUnreadNotifications ? (
          <span
            className="absolute top-[5.84px] right-[5.84px] size-[6.811px] rounded-[3.405px] border-2 border-[#eef1f6] bg-[#ef4444]"
            aria-hidden
          />
        ) : null}
      </button>
    </div>
  );

  if (!showTitle) {
    return (
      <header
        className={[
          "flex min-h-[82px] flex-wrap items-center justify-between gap-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {searchField}
        {utilityCluster}
      </header>
    );
  }

  return (
    <header
      className={[
        "flex min-h-[70px] flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h1"
        className="text-[26px] leading-none font-bold tracking-[-0.51px] text-[#0b1320]"
      >
        Regularity Compliance
      </Text>

      {utilityCluster}
    </header>
  );
}
