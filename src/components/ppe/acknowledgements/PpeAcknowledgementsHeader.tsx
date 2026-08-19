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
      className="text-ehs-muted-text size-4 shrink-0"
      aria-hidden="true"
    />
  );
}

/** Breadcrumb + title for My PPE Acknowledgements. */
export function PpeAcknowledgementsHeader() {
  return (
    <div className="relative flex w-full flex-col justify-center gap-1.5 rounded-2xl border border-ehs-hairline/70 bg-ehs-surface/50 px-4 py-4 shadow-(--ehs-shadow-panel) backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] md:px-6">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Safety</span>
          <Chevron />
          <Link href={PPE_ROUTE} className={crumbLink}>
            PPE Management
          </Link>
          <Chevron />
          <span className={crumbMuted}>Acknowledgements</span>
        </nav>

        <div className="flex items-center gap-2">
          <PpeBackLink className="md:hidden" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="h1" className="text1 text-ehs-darker">
              My PPE Acknowledgements
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text hidden md:block">
              Review and acknowledge your assigned PPE items
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
