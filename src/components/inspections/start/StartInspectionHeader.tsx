"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export function StartInspectionHeader() {
  return (
    <div className="backdrop-blur-2.5 relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <span className={crumbMuted}>Compliance</span>
        <Icon
          icon="mdi:chevron-right"
          className="size-3 shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <Link href="/dashboard/inspections" className={crumbLink}>
          Inspections
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="size-3 shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <span className={crumbMuted}>New</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Start Inspection
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Configure a new inspection
        </Text>
      </div>
    </div>
  );
}
