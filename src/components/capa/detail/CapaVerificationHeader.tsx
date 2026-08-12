"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-[#566072]";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-[#8892a3] transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-[11px] shrink-0 text-[#8892a3]"
      aria-hidden
    />
  );
}

export type CapaVerificationHeaderProps = Readonly<{
  record: CapaDetailRecord;
}>;

/** CAPA Verification page header — Figma 846:6033. */
export function CapaVerificationHeader(props: CapaVerificationHeaderProps) {
  const { record } = props;
  const detailHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}`;

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
          <Link href={detailHref} className={crumbLink}>
            {record.code}
          </Link>
          <Chevron />
          <span className={crumbMuted}>Verification</span>
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={detailHref}
            aria-label="Back to CAPA detail"
            className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-slate-50 md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="h1"
              className="text-[22px] leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
            >
              CAPA Verification
            </Text>
            <Text as="p" className="text-base leading-4.5 text-[#8892a3]">
              {record.controlLevel}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
