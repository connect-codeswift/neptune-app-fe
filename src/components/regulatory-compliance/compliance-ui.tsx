"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export const complianceGlassCardClass =
  "rounded-[19px] border border-white/90 bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px]";

export type CompliancePillProps = Readonly<{
  label: string;
  className?: string;
}>;

export function CompliancePill(props: CompliancePillProps) {
  const { label, className = "" } = props;

  return (
    <span
      className={[
        "inline-flex h-[20.244px] items-center rounded-full bg-[rgba(11,19,32,0.14)] px-[9px] text-[10px] leading-[15px] font-bold tracking-[0.21px] whitespace-nowrap text-[#566072]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}

export type ComplianceDeltaBadgeProps = Readonly<{
  value: string;
  tone: "green" | "danger" | "coral";
}>;

export function ComplianceDeltaBadge(props: ComplianceDeltaBadgeProps) {
  const { value, tone } = props;

  if (!value.trim()) {
    return null;
  }

  const isDanger = tone === "danger" || tone === "coral";

  return (
    <span
      className={[
        "inline-flex h-[20.244px] items-center rounded-full px-[9px] text-[10px] leading-[15px] font-bold tracking-[0.21px] whitespace-nowrap",
        isDanger
          ? "bg-[rgba(239,68,68,0.14)] text-[#ef4444]"
          : "bg-[rgba(16,185,129,0.14)] text-[#10b981]",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

export type ComplianceSegmentedFilterProps<T extends string> = Readonly<{
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}>;

export function ComplianceSegmentedFilter<T extends string>(
  props: ComplianceSegmentedFilterProps<T>,
) {
  const { options, value, onChange, className = "" } = props;

  return (
    <div
      className={[
        "inline-flex h-[27.568px] items-center rounded-[7.784px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[1.95px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              "inline-flex h-[21.73px] cursor-pointer items-center rounded-[5.838px] px-[9.73px] text-[10px] leading-none font-bold whitespace-nowrap transition-colors",
              isActive
                ? "bg-[#0b1320] text-[#f3f5f8]"
                : "text-[#566072] hover:text-[#0b1320]",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export type ComplianceRegisterSearchBarProps = Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  placeholder?: string;
  className?: string;
}>;

const registerToolbarBarClass =
  "h-[36px] rounded-[8px] border-[0.727px] border-[rgba(255,255,255,0.35)] bg-ehs-border shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)]";

const registerSearchBarClass =
  "h-[36px] rounded-[8px] border-[0.727px] border-[rgba(15,23,42,0.1)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)]";

export function ComplianceRegisterSearchBar(
  props: ComplianceRegisterSearchBarProps,
) {
  const {
    searchQuery,
    onSearchChange,
    totalCount,
    placeholder = "Search obligations, code, jurisdiction…",
    className = "",
  } = props;

  const countLabel =
    totalCount === 1 ? "1 obligation" : `${String(totalCount)} obligations`;

  return (
    <div className={["relative w-full", className].filter(Boolean).join(" ")}>
      <div
        className={[
          "flex w-full items-center justify-end px-[16.727px]",
          registerToolbarBarClass,
        ].join(" ")}
      >
        <p className="text-[12px] leading-[18px] font-normal whitespace-nowrap text-[#8892a3]">
          {countLabel}
        </p>
      </div>

      <div
        className={[
          "absolute top-0 left-0 z-10 w-[479px] max-w-[calc(100%-120px)]",
          registerSearchBarClass,
        ].join(" ")}
      >
        <Icon
          icon="mdi:magnify"
          className="pointer-events-none absolute top-[10.57px] left-[12px] size-[14px] text-[#8892a3]"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Search compliance register"
          className="h-full w-full rounded-[8px] border-0 bg-transparent py-[0.727px] pr-[10.727px] pl-[32.727px] text-[13px] leading-normal font-normal text-[#0b1320] outline-none placeholder:text-[#8892a3] focus:ring-0"
        />
      </div>
    </div>
  );
}

export type ComplianceViewToggleProps = Readonly<{
  activeView: "list" | "calendar";
  listHref?: string;
  calendarHref?: string;
  className?: string;
}>;

export function ComplianceViewToggle(props: ComplianceViewToggleProps) {
  const {
    activeView,
    listHref = "/dashboard/regulatory-compliance",
    calendarHref = "/dashboard/regulatory-compliance/calendar",
    className = "",
  } = props;

  return (
    <div
      className={[
        "inline-flex h-[47px] w-[269px] max-w-full items-center rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link
        href={listHref}
        className={[
          "inline-flex h-[34px] w-[110px] items-center justify-center gap-2 rounded-[9px] text-[13px] font-bold transition-all",
          activeView === "list"
            ? "bg-[#0891a6] text-white shadow-[0px_4px_12px_-4px_#0891a6]"
            : "text-[#566072] hover:text-[#0b1320]",
        ].join(" ")}
      >
        <Icon
          icon="mdi:view-grid-outline"
          className="size-[14px]"
          aria-hidden
        />
        <span>List view</span>
      </Link>

      <Link
        href={calendarHref}
        className={[
          "inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[9px] px-2 text-[13px] font-bold transition-all",
          activeView === "calendar"
            ? "bg-[#0891a6] text-white shadow-[0px_4px_12px_-4px_#0891a6]"
            : "text-[#566072] hover:text-[#0b1320]",
        ].join(" ")}
      >
        <Icon
          icon="mdi:calendar-month-outline"
          className="size-[14.595px] shrink-0"
          aria-hidden
        />
        <span>Calendar view</span>
      </Link>
    </div>
  );
}
