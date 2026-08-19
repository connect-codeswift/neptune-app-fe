"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type RegulatoryComplianceCalendarHeaderCardProps = Readonly<{
  className?: string;
}>;

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

/**
 * Calendar page header — breadcrumbs, title, subtitle.
 * Matches Compliance detail / PPE header typography (text1 / text8).
 */
export function RegulatoryComplianceCalendarHeaderCard(
  props: RegulatoryComplianceCalendarHeaderCardProps,
) {
  const { className = "" } = props;

  return (
    <div
      className={[
        "backdrop-blur-2.5 relative flex flex-col justify-center gap-1.5 rounded-2xl border border-ehs-border-ink/8 bg-ehs-surface/62 px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <span className={crumbMuted}>Safety</span>
        <Icon
          icon="mdi:chevron-right"
          className="size-3 shrink-0 text-ehs-muted-text"
          aria-hidden="true"
        />
        <Link href="/dashboard/regulatory-compliance" className={crumbLink}>
          Regulatory Compliance
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="size-3 shrink-0 text-ehs-muted-text"
          aria-hidden="true"
        />
        <span className={crumbMuted}>Calendar</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Compliance Calendar
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          View upcoming obligations by month
        </Text>
      </div>
    </div>
  );
}
