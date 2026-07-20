"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ReactNode } from "react";

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-xs font-medium transition-colors";

export function ReportNearMissHeader(props: Readonly<{ action?: ReactNode }>) {
  const { action } = props;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative flex flex-col justify-center gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="relative z-1 flex items-center gap-1"
        >
          <span className="text-ehs-gray text-xs font-medium">Safety</span>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4"
            aria-hidden="true"
          />
          <Link href="/dashboard/near-miss" className={crumbClass}>
            Near-Miss
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4"
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs font-medium">New Report</span>
        </nav>
        <Text
          as="h1"
          className="text-ehs-dark-bg relative z-1 text-2xl font-semibold tracking-[-0.2px]"
        >
          Report Near-Miss
        </Text>
      </div>
      <div>{action}</div>
    </div>
  );
}
