"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { ObservationDetail } from "@/app/dashboard/bbs/bbs-data";

export type ObservationDetailBannerCardProps = Readonly<{
  detail: ObservationDetail;
  className?: string;
}>;

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

function headerSubtitle(detail: ObservationDetail): string {
  return [detail.id, detail.location, detail.date, detail.time]
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "—")
    .join(" · ");
}

/**
 * Detail page header bar — breadcrumbs, title, Safe / At-Risk badge.
 * No back button (same pattern as Regulatory Compliance / Walk & Talk).
 */
export function ObservationDetailBannerCard(
  props: ObservationDetailBannerCardProps,
) {
  const { detail, className = "" } = props;
  const subtitle = headerSubtitle(detail);
  const isSafe = detail.type === "Safe";

  return (
    <div
      className={[
        "backdrop-blur-2.5 bg-ehs-surface/62 border-ehs-border-ink/8 relative flex flex-col justify-center gap-1.5 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6",
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
        <Link href="/dashboard/bbs" className={crumbLink}>
          BBS
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <span className={`${crumbMuted} truncate`}>{detail.id}</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker break-words">
            {detail.category !== "—"
              ? detail.category
              : `Observation ${detail.id}`}
          </Text>
          {subtitle ? (
            <Text as="p" className="text8 text-ehs-muted-text">
              {subtitle}
            </Text>
          ) : null}
        </div>

        <IncidentBadge
          label={detail.type}
          tone={isSafe ? "teal" : "warn"}
          showDot
          className="shrink-0"
        />
      </div>
    </div>
  );
}
