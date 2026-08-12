"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { ReactNode } from "react";
import { Text } from "@/components/Text";

const crumbMuted = "text4 font-normal text-ehs-gray";
const crumbLink =
  "text4 text-ehs-muted-text hover:text-ehs-gray font-normal transition-colors";

export function ReportHazardHeader(props: Readonly<{ action?: ReactNode }>) {
  const { action } = props;

  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative flex flex-col justify-center gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="relative z-1 flex items-center gap-1"
        >
          <span className={crumbMuted}>Safety</span>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4"
            aria-hidden="true"
          />
          <Link href="/dashboard/hazard" className={crumbLink}>
            Hazard Reporting
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4"
            aria-hidden="true"
          />
          <span className={crumbMuted}>Report New</span>
        </nav>
        <Text as="h1" className="text1 text-ehs-darker relative z-1">
          Report a Hazard
        </Text>
        <p className="text8 text-ehs-muted-text relative z-1">
          Report an unsafe condition or hazardous situation
        </p>
      </div>
      <div className="relative z-1">{action}</div>
    </div>
  );
}
