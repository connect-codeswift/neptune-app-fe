"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { PpeBackLink, PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-3 shrink-0"
      aria-hidden="true"
    />
  );
}

/** Breadcrumb + title bar for the Replacement Request form. */
export function ReplacementRequestHeader() {
  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col justify-center gap-1.5 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] md:px-5.5">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Safety</span>
          <Chevron />
          <Link href={PPE_ROUTE} className={crumbLink}>
            PPE Management
          </Link>
          <Chevron />
          <span className={crumbMuted}>Replacement Request</span>
        </nav>

        <div className="flex items-center gap-2">
          <PpeBackLink />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="h1" className="text1 text-ehs-darker">
              Replacement Request
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text hidden md:block">
              Request replacement PPE — goes to EHS approval queue
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
