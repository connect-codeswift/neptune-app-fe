"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type IncidentKpisHeaderProps = Readonly<{
  title?: string;
  siteLabel?: string;
  dateRangeLabel?: string;
  onSiteClick?: () => void;
  onDateRangeClick?: () => void;
  onExportClick?: () => void;
  className?: string;
}>;

const controlClass =
  "border-ehs-border text-ehs-gray inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-sm shadow-sm transition-colors hover:bg-ehs-light-bg";

export function IncidentKpisHeader(props: Readonly<IncidentKpisHeaderProps>) {
  const {
    title = "Incident KPIs",
    siteLabel = "Rawalpindi",
    dateRangeLabel = "Year to date",
    onSiteClick,
    onDateRangeClick,
    onExportClick,
    className = "",
  } = props;

  return (
    <header
      className={[
        "flex flex-wrap items-center justify-between gap-4 px-4 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h1"
        className="text-ehs-darker text-2xl font-bold tracking-tight"
      >
        {title}
      </Text>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onSiteClick} className={controlClass}>
          <Icon
            icon="mdi:factory"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
          <span className="text-ehs-darker font-semibold whitespace-nowrap">
            {siteLabel}
          </span>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
        </button>

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
          <span className="whitespace-nowrap">{dateRangeLabel}</span>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text text-sm"
            aria-hidden="true"
          />
        </button>

        <Button
          type="button"
          variant="tertiary"
          onClick={onExportClick}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold"
        >
          <Icon icon="mdi:download" className="text-sm" aria-hidden="true" />
          Export
        </Button>
      </div>
    </header>
  );
}
