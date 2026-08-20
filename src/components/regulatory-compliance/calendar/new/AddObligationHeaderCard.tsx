"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type AddObligationHeaderCardProps = Readonly<{
  className?: string;
}>;

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

/**
 * Add Obligation page header — breadcrumbs, title, subtitle.
 * Matches Compliance calendar / detail header typography (text1 / text8).
 */
export function AddObligationHeaderCard(
  props: Readonly<AddObligationHeaderCardProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={[
        "backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col justify-center gap-1.5 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6",
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
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Link href="/dashboard/regulatory-compliance" className={crumbLink}>
          Regulatory Compliance
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Link
          href="/dashboard/regulatory-compliance/calendar"
          className={crumbLink}
        >
          Calendar
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <span className={crumbMuted}>New</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Add Compliance Obligation
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Add a new regulatory or safety compliance item
        </Text>
      </div>
    </div>
  );
}
