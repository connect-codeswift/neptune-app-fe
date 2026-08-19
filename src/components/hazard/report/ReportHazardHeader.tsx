"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const HAZARD_ROUTE = "/dashboard/hazard";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export type ReportHazardHeaderProps = Readonly<{
  action?: React.ReactNode;
}>;

export function ReportHazardHeader(props: Readonly<ReportHazardHeaderProps>) {
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
          <Link href={HAZARD_ROUTE} className={crumbLink}>
            Hazard Reporting
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Text as="span" className={crumbMuted}>
            Report New
          </Text>
        </nav>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Report a Hazard
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Report an unsafe condition or hazardous situation
          </Text>
        </div>
      </div>
      {action ? <div className="relative z-1">{action}</div> : null}
    </div>
  );
}
