"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";

export type RegulatoryComplianceCalendarHeaderCardProps = Readonly<{
  monthLabel?: string;
  onAddObligation?: () => void;
  className?: string;
}>;

export function RegulatoryComplianceCalendarHeaderCard(
  props: RegulatoryComplianceCalendarHeaderCardProps,
) {
  const { monthLabel = "", onAddObligation, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {/* Breadcrumb */}
          <div className="text-ehs-gray flex items-center gap-1.5 text-[13px] font-light">
            <Link
              href="/dashboard/regulatory-compliance"
              className="hover:text-ehs-dark-bg hover:underline"
            >
              Compliance
            </Link>
            <span>&gt;</span>
            <Text as="span" className="text-ehs-gray font-semibold">
              Calendar
            </Text>
          </div>

          {/* Title */}
          <Text
            as="h1"
            className="text-ehs-dark-bg text-[22px] leading-tight font-semibold"
          >
            Compliance Calendar
          </Text>

          {/* Subtitle */}
          <Text as="p" className="text-ehs-muted-text text-[13px] font-light">
            {monthLabel}
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-3">
          {/* List View Button */}
          <Link
            href="/dashboard/regulatory-compliance"
            className="border-ehs-border text-ehs-dark-bg hover:bg-ehs-light-bg inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-[13px] font-light shadow-xs transition-colors"
          >
            <Icon
              icon="mdi:view-grid-outline"
              className="text-base"
              aria-hidden="true"
            />
            <span>List View</span>
          </Link>

          {/* Add Obligation Button */}
          <button
            type="button"
            onClick={onAddObligation}
            className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-light-text inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold shadow-xs transition-all"
          >
            <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
            <span>Add Obligation</span>
          </button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
