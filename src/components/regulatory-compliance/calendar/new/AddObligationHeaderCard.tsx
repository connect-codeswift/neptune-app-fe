"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";

export type AddObligationHeaderCardProps = Readonly<{
  className?: string;
}>;

export function AddObligationHeaderCard(
  props: Readonly<AddObligationHeaderCardProps>,
) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-ehs-gray flex items-center gap-1.5 text-[13px] font-medium"
        >
          <Link
            href="/dashboard/regulatory-compliance"
            className="hover:text-ehs-dark-bg hover:underline"
          >
            Compliance
          </Link>
          <Icon icon="mdi:chevron-right" className="size-3 shrink-0" aria-hidden="true" />
          <Link
            href="/dashboard/regulatory-compliance/calendar"
            className="hover:text-ehs-dark-bg hover:underline"
          >
            Calendar
          </Link>
          <Icon icon="mdi:chevron-right" className="size-3 shrink-0" aria-hidden="true" />
          <Text as="span" className="text-ehs-gray font-bold">
            New
          </Text>
        </nav>

        {/* Title */}
        <Text as="h1" className="text-ehs-dark-bg text-[26px] leading-tight font-bold">
          Add Compliance Obligation
        </Text>

        {/* Subtitle */}
        <Text as="p" className="text-ehs-muted-text text-[13px] font-medium">
          Add a new regulatory or safety compliance item
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
