"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { LotoEnergySourceView } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";

const kindIcon: Record<LotoEnergySourceView["kind"], string> = {
  electrical: "mdi:flash",
  hydraulic: "mdi:water",
  pneumatic: "mdi:weather-windy",
  other: "mdi:alert-circle-outline",
};

const kindIconClass: Record<LotoEnergySourceView["kind"], string> = {
  electrical: "text-[#f59e0b]",
  hydraulic: "text-[#3b82f6]",
  pneumatic: "text-[#0891a6]",
  other: "text-[#8892a3]",
};

export type LotoEnergySourcesPanelProps = Readonly<{
  sources: readonly LotoEnergySourceView[];
}>;

/** Energy Sources sidebar — Figma 6915:57649. */
export function LotoEnergySourcesPanel(props: LotoEnergySourcesPanelProps) {
  const { sources } = props;
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useDismissOnOutsideClick(listRef, openSourceId !== null, () => {
    setOpenSourceId(null);
  });

  return (
    <div className="relative rounded-5 border border-white/90 bg-[rgba(255,255,255,0.82)] p-4.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex flex-col gap-3.5">
        <h2 className="text3 text-ehs-darker">Energy Sources</h2>
        <ul ref={listRef} className="flex flex-col gap-1.5">
          {sources.map((source) => {
            const isOpen = openSourceId === source.id;

            return (
              <li
                key={source.id}
                className="relative flex items-center gap-2.5 rounded-2.5 border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.04)] px-3 py-2.5"
              >
                <Icon
                  icon={kindIcon[source.kind]}
                  className={`size-5 shrink-0 ${kindIconClass[source.kind]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text4 text-ehs-darker font-semibold">
                    {source.label}
                  </p>
                  <p className="text4 text-[#b3bbc8]">{source.pointLabel}</p>
                </div>
                <button
                  type="button"
                  aria-label={`About ${source.label}`}
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpenSourceId(isOpen ? null : source.id);
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5 text-[#b3bbc8] transition-colors hover:text-ehs-gray"
                >
                  <Icon
                    icon="mdi:information-outline"
                    className="size-5"
                    aria-hidden="true"
                  />
                </button>

                {isOpen ? (
                  <div
                    role="tooltip"
                    className="absolute top-full right-3 left-3 z-20 mt-1.5 rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-white px-3.5 py-3 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
                  >
                    <p className="text4 text-ehs-darker font-semibold">
                      {source.label} — {source.pointLabel}
                    </p>
                    <p className="text4 mt-1 text-[#566072]">
                      Every energy source on this machine must be isolated at
                      its isolation point and secured with your personal lock
                      and tag before work begins. Verify zero energy at each
                      point before starting.
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
