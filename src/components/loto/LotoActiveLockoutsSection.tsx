"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  LOTO_ACTIVE_LOCKOUTS,
  type LotoActiveLockout,
  type LotoActiveLockoutAccent,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoRemoveLockoutRoute } from "@/app/dashboard/lockout-tagout/loto-lockout-data";

const accentBorderClass: Record<LotoActiveLockoutAccent, string> = {
  amber: "border-[rgba(245,158,11,0.25)]",
  red: "border-[rgba(239,68,68,0.18)]",
};

const META_FIELDS = [
  {
    key: "operator",
    label: "Operator",
    icon: "mdi:account-outline",
    getValue: (item: LotoActiveLockout) => item.operator,
  },
  {
    key: "lockNumber",
    label: "Lock Number",
    icon: "mdi:lock-outline",
    getValue: (item: LotoActiveLockout) => item.lockNumber,
  },
  {
    key: "startedAt",
    label: "Started",
    icon: "mdi:clock-outline",
    getValue: (item: LotoActiveLockout) => item.startedAt,
  },
  {
    key: "expectedEndAt",
    label: "Expected End",
    icon: "mdi:calendar-check-outline",
    getValue: (item: LotoActiveLockout) => item.expectedEndAt,
  },
] as const;

/** Active lockout cards — Figma 6888:48666. */
export function LotoActiveLockoutsSection() {
  const router = useRouter();

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {LOTO_ACTIVE_LOCKOUTS.map((item) => (
        <article
          key={item.id}
          className={[
            "rounded-[20px] border bg-[rgba(255,255,255,0.62)] px-5 py-5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]",
            accentBorderClass[item.accent],
          ].join(" ")}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-ehs-darker text-lg leading-[22.5px] font-bold">
                  {item.equipmentName}
                </h3>
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-sm font-bold text-[#ef4444]">
                  LOCKED OUT
                </span>
              </div>
              <p className="text-ehs-darker/70 mt-0.75 text-sm leading-[18.75px]">
                {item.purpose}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                router.push(lotoRemoveLockoutRoute(item.id));
              }}
              className="inline-flex h-[39px] shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.14)] px-4 text-base font-medium text-[#2a3446] transition-colors"
            >
              <Icon icon="mdi:lock-open-outline" className="size-3.5" />
              Remove Lockout
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {META_FIELDS.map((field) => (
              <div
                key={field.key}
                className="rounded-[10px] px-3 pt-2.5 pb-2.5"
              >
                <div className="flex items-center gap-[5px]">
                  <Icon
                    icon={field.icon}
                    className="size-3.5 text-[#b3bbc8]"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold tracking-[0.6px] text-[#b3bbc8] uppercase">
                    {field.label}
                  </span>
                </div>
                <p className="text-ehs-darker mt-1 text-sm leading-[19.5px] font-semibold">
                  {field.getValue(item)}
                </p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
