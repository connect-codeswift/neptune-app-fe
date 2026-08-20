"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

/** Breadcrumb + title bar above the Issue PPE form. */
export function IssuePpeHeader() {
  return (
    <div className="border-ehs-hairline/70 bg-ehs-surface/50 relative flex w-full items-center justify-between gap-4 rounded-2xl border px-6 py-4 shadow-(--ehs-shadow-panel) backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col justify-center gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 overflow-x-auto"
        >
          <span className={crumbMuted}>Safety</span>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4 shrink-0"
            aria-hidden="true"
          />
          <Link href={PPE_ROUTE} className={crumbLink}>
            PPE Management
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-4 shrink-0"
            aria-hidden="true"
          />
          <span className={crumbMuted}>Issue PPE</span>
        </nav>

        <Text as="h1" className="text1 text-ehs-darker">
          Issue PPE
        </Text>
        <p className="text8 text-ehs-muted-text">
          Assign personal protective equipment to an employee
        </p>
      </div>
    </div>
  );
}
