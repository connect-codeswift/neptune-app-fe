"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-ehs-gray text-sm font-medium";
const crumbLink =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-2.75 shrink-0"
      aria-hidden="true"
    />
  );
}

/** Create CAPA page header — Figma 7123:41556. */
export function CreateCapaHeader() {
  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col gap-1.5 rounded-2xl border px-4 pt-3.5 pb-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-5.5">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Compliance</span>
          <Chevron />
          <Link href={CAPA_ROUTE} className={crumbLink}>
            CAPA
          </Link>
          <Chevron />
          <span className={crumbMuted}>New</span>
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={CAPA_ROUTE}
            aria-label="Back to CAPA Dashboard"
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="h1"
              className="text-5.5 text-ehs-dark-bg leading-7 font-semibold tracking-[-0.2px]"
            >
              Create CAPA
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              Assign a new corrective or preventive action
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
