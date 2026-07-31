"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type VersionHistoryHeaderProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

const crumbMuted =
  "text-[11px] font-medium leading-[16.5px] text-[#8892a3] transition-colors hover:text-[#566072]";
const crumbActive = "text-[11px] font-medium leading-[16.5px] text-[#566072]";

/**
 * Version History page hero (Figma 5568:25072).
 */
export function VersionHistoryHeader(
  props: Readonly<VersionHistoryHeaderProps>,
) {
  const { document, className = "" } = props;
  const detailHref = `/dashboard/policy-maker/${encodeURIComponent(document.id)}`;

  return (
    <div
      className={[
        "relative flex w-full min-w-0 flex-col gap-1.5 rounded-[16px] border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3.5 py-3.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-[22px] sm:pt-[14px] sm:pb-[14px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <span className={crumbActive}>Compliance</span>
        <Icon
          icon="mdi:chevron-right"
          className="size-[11px] shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <Link href="/dashboard/policy-maker" className={crumbMuted}>
          Documents
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="size-[11px] shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <Link href={detailHref} className={`${crumbMuted} truncate`}>
          {document.code}
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="size-[11px] shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
        <span className={crumbActive}>Versions</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text
          as="h1"
          className="text-[18px] leading-7 font-semibold tracking-[-0.2px] text-[#0b1320] sm:text-[22px] sm:leading-[28px]"
        >
          Version History
        </Text>
        <Text
          as="p"
          className="max-w-full truncate text-[12px] leading-[18px] text-[#8892a3]"
        >
          {document.title}
        </Text>
      </div>
    </div>
  );
}
