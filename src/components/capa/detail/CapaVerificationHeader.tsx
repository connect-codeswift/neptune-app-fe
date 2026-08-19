"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-ehs-gray";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-ehs-muted-text transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-2.75 shrink-0"
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
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="h1"
              className="text-5.5 text-ehs-dark-bg leading-7 font-semibold tracking-[-0.2px]"
            >
              CAPA Verification
            </Text>
            <Text as="p" className="text-ehs-muted-text text-base leading-4.5">
              {record.controlLevel}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
