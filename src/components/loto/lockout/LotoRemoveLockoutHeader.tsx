"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { type LotoRemoveLockoutContext } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

const crumbMuted = "text4 font-normal text-ehs-placeholder";
const crumbLink =
  "text4 hover:text-ehs-gray font-normal text-ehs-muted-text transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-placeholder size-3.5 shrink-0"
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
    <div className="backdrop-blur-2.5 bg-ehs-surface/62 border-ehs-border-ink/8 relative rounded-2xl border px-5.5 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-['']">
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
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="h1" className="text1 text-ehs-darker">
              Remove Lockout
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text">
              {context.equipmentName}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
