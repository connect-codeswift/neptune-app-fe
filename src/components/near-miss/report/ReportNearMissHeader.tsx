"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export type ReportNearMissHeaderProps = Readonly<{
  action?: React.ReactNode;
}>;

export function ReportNearMissHeader(
  props: Readonly<ReportNearMissHeaderProps>,
) {
  const { action } = props;

  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex w-full items-center justify-between rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6">
      <div className="relative z-1 flex min-w-0 flex-col justify-center gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1"
        >
          <Text as="span" className={crumbMuted}>
            Safety
          </Text>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Link href="/dashboard/near-miss" className={crumbLink}>
            Near-Miss
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Text as="span" className={crumbMuted}>
            New Report
          </Text>
        </nav>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Report a Near Miss
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Report something that almost caused harm
          </Text>
        </div>
      </div>
      {action ? <div className="relative z-1">{action}</div> : null}
    </div>
  );
}
