import { Icon } from "@iconify/react";
import type { LotoEnergySourceView } from "@/app/dashboard/lockout-tagout/loto-lockout-data";

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

  return (
    <div className="relative rounded-[20px] border border-white/90 bg-[rgba(255,255,255,0.82)] p-[18px] shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex flex-col gap-3.5">
        <h2 className="text-ehs-darker text-lg leading-[19.5px] font-bold">
          Energy Sources
        </h2>
        <ul className="flex flex-col gap-1.5">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.04)] px-3 py-2.5"
            >
              <Icon
                icon={kindIcon[source.kind]}
                className={`size-5 shrink-0 ${kindIconClass[source.kind]}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-ehs-darker text-sm leading-[18.75px] font-semibold">
                  {source.label}
                </p>
                <p className="text-sm leading-[16.5px] text-[#b3bbc8]">
                  {source.pointLabel}
                </p>
              </div>
              <Icon
                icon="mdi:information-outline"
                className="size-5 shrink-0 text-[#b3bbc8]"
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
