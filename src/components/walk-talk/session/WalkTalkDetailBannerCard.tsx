"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
import type { WalkTalkSessionDetail } from "@/app/dashboard/walk-talk/walk-talk-data";
import { formatRecordDisplayId } from "@/lib/format-record-id";

export type WalkTalkDetailBannerCardProps = Readonly<{
  detail: WalkTalkSessionDetail;
  sessionType?: string;
  className?: string;
}>;

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

function headerSubtitle(detail: WalkTalkSessionDetail): string {
  return [
    formatRecordDisplayId("WT", detail.id),
    detail.site,
    detail.date,
    detail.time,
  ]
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "—")
    .join(" · ");
}

/**
 * Detail page header bar — breadcrumbs, title, type pill.
 * No back button (same pattern as Regulatory Compliance).
 */
export function WalkTalkDetailBannerCard(props: WalkTalkDetailBannerCardProps) {
  const { detail, sessionType = "Walk & Talk", className = "" } = props;
  const subtitle = headerSubtitle(detail);

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
        <Link href="/dashboard/walk-talk" className={crumbLink}>
          Walk & Talk
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <span className={`${crumbMuted} truncate`}>
          {formatRecordDisplayId("WT", detail.id)}
        </span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker break-words">
            {detail.topic || "Walk & Talk Session"}
          </Text>
          {subtitle ? (
            <Text as="p" className="text8 text-ehs-muted-text">
              {subtitle}
            </Text>
          ) : null}
        </div>

        <CompliancePill label={sessionType} className="shrink-0" />
      </div>
    </div>
  );
}
