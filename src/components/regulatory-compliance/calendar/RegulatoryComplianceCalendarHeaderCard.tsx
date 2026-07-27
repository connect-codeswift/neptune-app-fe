"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export type RegulatoryComplianceCalendarHeaderCardProps = Readonly<{
  monthLabel?: string;
  onAddObligation?: () => void;
  className?: string;
}>;

export function RegulatoryComplianceCalendarHeaderCard(
  props: RegulatoryComplianceCalendarHeaderCardProps,
) {
  const {
    monthLabel = "March 2025",
    onAddObligation,
    className = "",
  } = props;

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[20px] border border-white/90 bg-white/70 p-6 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748b]">
          <Link
            href="/dashboard/regulatory-compliance"
            className="hover:text-[#0f172a] hover:underline"
          >
            Compliance
          </Link>
          <span>&gt;</span>
          <span className="font-bold text-[#64748b]">Calendar</span>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold leading-tight text-[#0f172a]">
          Compliance Calendar
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] font-medium text-[#94a3b8]">
          {monthLabel}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {/* List View Button */}
        <Link
          href="/dashboard/regulatory-compliance"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-[13px] font-bold text-[#0f172a] shadow-xs transition-colors hover:bg-[#f8fafc]"
        >
          <Icon icon="mdi:format-list-bulleted" className="text-base" />
          <span>List View</span>
        </Link>

        {/* Add Obligation Button */}
        <button
          type="button"
          onClick={onAddObligation}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0891a6] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-all hover:bg-[#007085]"
        >
          <Icon icon="mdi:plus" className="text-base" />
          <span>Add Obligation</span>
        </button>
      </div>
    </div>
  );
}
