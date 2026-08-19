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
  electrical: "text-ehs-yellow",
  hydraulic: "text-ehs-blue",
  pneumatic: "text-ehs-normal-blue",
  other: "text-ehs-muted-text",
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
    <div className="rounded-5 before:rounded-5 border-ehs-hairline/90 bg-ehs-surface/82 relative border p-4.5 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-['']">
      <div className="relative z-1 flex flex-col gap-3.5">
        <h2 className="text3 text-ehs-darker">Energy Sources</h2>
        <ul ref={listRef} className="flex flex-col gap-1.5">
          {sources.map((source) => {
            const isOpen = openSourceId === source.id;

            return (
              <li
                key={source.id}
                className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface-inverse/4 relative flex items-center gap-2.5 border px-3 py-2.5"
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
                  <p className="text4 text-ehs-placeholder">
                    {source.pointLabel}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`About ${source.label}`}
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpenSourceId(isOpen ? null : source.id);
                  }}
                  className="hover:text-ehs-gray text-ehs-placeholder inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
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
                    className="rounded-2.5 bg-ehs-surface border-ehs-border-ink/10 absolute top-full right-3 left-3 z-20 mt-1.5 border px-3.5 py-3 shadow-(--ehs-shadow-popover)"
                  >
                    <p className="text4 text-ehs-darker font-semibold">
                      {source.label} — {source.pointLabel}
                    </p>
                    <p className="text4 text-ehs-gray mt-1">
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
