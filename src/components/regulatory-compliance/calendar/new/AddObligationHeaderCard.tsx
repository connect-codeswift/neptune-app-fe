"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type AddObligationHeaderCardProps = Readonly<{
  className?: string;
}>;

const pageHeaderShellClass =
  "rounded-[16px] border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)]";

export function AddObligationHeaderCard(
  props: Readonly<AddObligationHeaderCardProps>,
) {
  const { className = "" } = props;

  return (
    <section
      className={[pageHeaderShellClass, "relative overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col px-[22px] pt-[14px] pb-[22px]">
        <nav
          aria-label="Breadcrumb"
          className="flex h-[16.5px] items-center gap-[4px] text-[11px] leading-[16.5px] font-medium"
        >
          <Link
            href="/dashboard/regulatory-compliance"
            className="text-[#566072] transition-colors hover:text-[#0b1320]"
          >
            Compliance
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="size-[11px] shrink-0 text-[#566072]"
            aria-hidden
          />
          <Link
            href="/dashboard/regulatory-compliance/calendar"
            className="text-[#8892a3] transition-colors hover:text-[#566072]"
          >
            Calendar
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="size-[11px] shrink-0 text-[#566072]"
            aria-hidden
          />
          <Text as="span" className="text-[#566072]">
            New
          </Text>
        </nav>

        <div className="mt-[6px]">
          <Text
            as="h1"
            className="text-[22px] leading-[28px] font-semibold tracking-[-0.2px] text-[#0b1320]"
          >
            Add Compliance Obligation
          </Text>
          <Text
            as="p"
            className="mt-[2px] text-[12px] leading-[18px] font-normal text-[#8892a3]"
          >
            Add a new regulatory or safety compliance item
          </Text>
        </div>
      </div>
    </section>
  );
}
