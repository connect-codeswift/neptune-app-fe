"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-[#566072] text-sm font-medium";
const crumbLink =
  "text-[#8892a3] hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-[11px] shrink-0 text-[#8892a3]"
      aria-hidden="true"
    />
  );
}

/** Create CAPA page header — Figma 7123:41556. */
export function CreateCapaHeader() {
  return (
    <div className="relative flex flex-col gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-[22px] pt-3.5 pb-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
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
            className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-slate-50 md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="h1"
              className="text-[22px] leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
            >
              Create CAPA
            </Text>
            <Text as="p" className="text-sm text-[#8892a3]">
              Assign a new corrective or preventive action
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
