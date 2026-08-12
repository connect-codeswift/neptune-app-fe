"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";

export type RegulatoryComplianceCalendarHeaderCardProps = Readonly<{
  className?: string;
}>;

export function RegulatoryComplianceCalendarHeaderCard(
  props: RegulatoryComplianceCalendarHeaderCardProps,
) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-3 px-6"
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-2.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-ehs-gray flex items-center gap-1.5 text-3.25 font-light">
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

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/dashboard/regulatory-compliance"
            className="border-ehs-border text-ehs-dark-bg hover:bg-ehs-light-bg inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-3.25 font-light shadow-xs transition-colors"
          >
            <Icon
              icon="mdi:view-grid-outline"
              className="text-base"
              aria-hidden="true"
            />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
