"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type DashboardHeaderProps = Readonly<{
  title?: string;
  searchPlaceholder?: string;
  dateRangeLabel?: string;
  siteChangerLabel?: string;
  actionLabel?: string;
  className?: string;
  onActionClick?: () => void;
  onNotificationsClick?: () => void;
  onDateRangeClick?: () => void;
  onSiteChangerClick?: () => void;
  hasUnreadNotifications?: boolean;
  searchonleft?: boolean;
}>;

const headerControlClass =
  "border-ehs-border inline-flex shrink-0 items-center bg-white shadow-sm transition-colors hover:bg-ehs-light-bg";

function SearchField(props: Readonly<{ placeholder: string }>) {
  const { placeholder } = props;

  return (
    <div className="relative w-full min-w-0 sm:w-88">
      <Icon
        icon="mdi:magnify"
        className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={placeholder}
        className="border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-lg border bg-white py-2.5 pr-14 pl-9 text-sm shadow-sm transition outline-none focus:ring-2"
      />
      <kbd className="border-ehs-border text-ehs-muted-text bg-ehs-light-bg pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border px-1 py-px text-[8px] font-medium sm:inline">
        ⌘K
      </kbd>
    </div>
  );
}

function DateRangeButton(
  props: Readonly<{ label: string; onClick?: () => void }>,
) {
  const { label, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${headerControlClass} text-ehs-dark-bg min-w-0 gap-1.5 rounded-lg border px-2.5 py-2 text-sm sm:px-3 sm:py-2.5`}
    >
      <Icon
        icon="mdi:calendar-outline"
        className="text-ehs-muted-text shrink-0 text-base"
        aria-hidden="true"
      />
      <span className="max-w-[9rem] truncate whitespace-nowrap sm:max-w-none">
        {label}
      </span>
      <Icon
        icon="mdi:chevron-down"
        className="text-ehs-muted-text shrink-0 text-base"
        aria-hidden="true"
      />
    </button>
  );
}

function ActionButton(
  props: Readonly<{ label: string; onClick?: () => void }>,
) {
  const { label, onClick } = props;

  return (
    <Button
      type="button"
      variant="primary"
      onClick={onClick}
      className="shrink-0 rounded-xl px-4 py-2.5 text-sm"
    >
      <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
      {label}
    </Button>
  );
}

function SiteChanger(props: Readonly<{ label: string; onClick?: () => void }>) {
  const { label, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${headerControlClass} text-ehs-darker gap-2 rounded-lg border px-3 py-2 text-sm font-semibold`}
    >
      <Icon icon="mdi:factory" className="text-base" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
      <Icon icon="mdi:chevron-down" className="text-base" aria-hidden="true" />
    </button>
  );
}

function NotificationsButton(
  props: Readonly<{
    hasUnread: boolean;
    onClick?: () => void;
  }>,
) {
  const { hasUnread, onClick } = props;

  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={onClick}
      className={`${headerControlClass} relative h-10 w-9 justify-center rounded-lg border`}
    >
      <Icon
        icon="mdi:bell-outline"
        className="text-ehs-darker text-lg"
        aria-hidden="true"
      />
      {hasUnread ? (
        <span
          className="bg-ehs-red border-ehs-light-text absolute top-2 right-2 h-1.5 w-1.5 rounded-lg border"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

export function DashboardHeader(props: Readonly<DashboardHeaderProps>) {
  const {
    title,
    searchPlaceholder,
    dateRangeLabel,
    siteChangerLabel,
    actionLabel,
    onActionClick,
    onNotificationsClick,
    onDateRangeClick,
    onSiteChangerClick,
    hasUnreadNotifications,
    className = "",
    searchonleft,
  } = props;

  const showNotifications =
    onNotificationsClick !== undefined || hasUnreadNotifications !== undefined;

  const showRightControls =
    Boolean(dateRangeLabel) ||
    Boolean(siteChangerLabel) ||
    Boolean(actionLabel) ||
    showNotifications ||
    (!searchonleft && Boolean(searchPlaceholder));

  return (
    <header
      className={[
        "flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4",
        "lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        {title ? (
          <Text
            as="h1"
            className="text-ehs-darker shrink-0 text-xl font-bold tracking-tight sm:text-2xl"
          >
            {title}
          </Text>
        ) : null}

        {searchonleft && searchPlaceholder ? (
          <SearchField placeholder={searchPlaceholder} />
        ) : null}
      </div>

      {showRightControls ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          {!searchonleft && searchPlaceholder ? (
            <SearchField placeholder={searchPlaceholder} />
          ) : null}

          {dateRangeLabel ? (
            <DateRangeButton
              label={dateRangeLabel}
              onClick={onDateRangeClick}
            />
          ) : null}

          {showNotifications ? (
            <NotificationsButton
              hasUnread={hasUnreadNotifications ?? false}
              onClick={onNotificationsClick}
            />
          ) : null}

          {siteChangerLabel ? (
            <SiteChanger
              label={siteChangerLabel}
              onClick={onSiteChangerClick}
            />
          ) : null}

          {actionLabel ? (
            <ActionButton label={actionLabel} onClick={onActionClick} />
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
