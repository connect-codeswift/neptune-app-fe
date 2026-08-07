"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import type { LotoEquipmentDetail } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

const crumbMuted = "text-[#b3bbc8] text-sm font-normal";
const crumbLink =
  "text-[#8892a3] hover:text-ehs-gray text-xs font-normal transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-[11px] shrink-0 text-[#b3bbc8]"
      aria-hidden="true"
    />
  );
}

export type LotoEquipmentDetailHeaderProps = Readonly<{
  detail: LotoEquipmentDetail;
  onApplyLockout: () => void;
  /** When true, primary action is Remove Lockout instead of Apply. */
  isLockedOut?: boolean;
}>;

/** Breadcrumb + title + Apply/Remove Lockout — Figma 6888:50991. */
export function LotoEquipmentDetailHeader(
  props: LotoEquipmentDetailHeaderProps,
) {
  const { detail, onApplyLockout, isLockedOut = false } = props;
  const actionLabel = isLockedOut ? "Remove Lockout" : "Apply Lockout";
  const actionIcon = isLockedOut ? "mdi:lock-open-outline" : "mdi:lock-outline";

  return (
    <div className="relative rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-5.5 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
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
          <span className={crumbMuted}>{detail.equipmentCode}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={LOTO_ROUTE}
              aria-label="Back to Lockout / Tagout"
              className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-1">
              <Text
                as="h1"
                className="text-ehs-darker text-base font-bold tracking-[-0.44px] md:text-[22px]"
              >
                {detail.name}
              </Text>
              <Text as="p" className="text-sm text-[#8892a3]">
                {`${detail.type} · ${detail.location}`}
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant={isLockedOut ? "primary" : "danger"}
            onClick={onApplyLockout}
            className={[
              "gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold",
              isLockedOut
                ? "shadow-[0px_4px_7px_rgba(8,145,166,0.4)]"
                : "shadow-[0px_4px_7px_rgba(239,68,68,0.4)]",
            ].join(" ")}
          >
            <Icon icon={actionIcon} className="size-3.5 shrink-0" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
