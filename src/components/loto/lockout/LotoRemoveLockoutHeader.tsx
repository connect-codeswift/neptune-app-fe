"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { type LotoRemoveLockoutContext } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

const crumbMuted = "text4 font-normal text-[#b3bbc8]";
const crumbLink =
  "text4 hover:text-ehs-gray font-normal text-[#8892a3] transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-3.5 shrink-0 text-[#b3bbc8]"
      aria-hidden="true"
    />
  );
}

export type LotoRemoveLockoutHeaderProps = Readonly<{
  context: LotoRemoveLockoutContext;
}>;

/** Breadcrumb + title — Figma 6863:46225. */
export function LotoRemoveLockoutHeader(props: LotoRemoveLockoutHeaderProps) {
  const { context } = props;
  const detailHref = lotoEquipmentDetailRoute(context.equipmentId);

  return (
    <div className="backdrop-blur-2.5 relative rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-5.5 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex flex-col gap-2">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Safety</span>
          <Chevron />
          <Link href={LOTO_ROUTE} className={crumbLink}>
            LOTO
          </Link>
          <Chevron />
          <Link href={detailHref} className={crumbLink}>
            {context.equipmentCode}
          </Link>
          <Chevron />
          <span className={crumbMuted}>Remove Lockout</span>
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`${LOTO_ROUTE}?tab=active-lockouts`}
            aria-label="Back to active lockouts"
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="h1" className="text1 text-ehs-darker">
              Remove Lockout
            </Text>
            <Text as="p" className="text4 text-[#8892a3]">
              {context.equipmentName}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
