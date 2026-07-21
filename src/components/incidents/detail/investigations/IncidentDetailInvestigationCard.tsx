"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type WhyChainItem = Readonly<{
  step: number;
  label: string;
  text: string;
  isRootCause?: boolean;
}>;

export type IncidentDetailInvestigationCardProps = Readonly<{
  whyChain?: readonly WhyChainItem[];
  onOpenHrca?: () => void;
  className?: string;
}>;

const DEFAULT_WHY_CHAIN: readonly WhyChainItem[] = [
  {
    step: 1,
    label: "WHY 1",
    text: "The high-pressure hose ruptured at the coupling.",
  },
  {
    step: 2,
    label: "WHY 2",
    text: "The hose had fatigue cracking near the crimp.",
  },
  {
    step: 3,
    label: "WHY 3",
    text: "It had been in service 14 months under cyclic load.",
  },
  {
    step: 4,
    label: "WHY 4",
    text: "No condition-based replacement schedule existed.",
  },
  {
    step: 5,
    label: "ROOT CAUSE",
    text: "Inspections were visual-only and missed internal fatigue.",
    isRootCause: true,
  },
];

export function IncidentDetailInvestigationCard(
  props: Readonly<IncidentDetailInvestigationCardProps>,
) {
  const { whyChain = DEFAULT_WHY_CHAIN, onOpenHrca, className = "" } = props;

  const handleOpenHrca = onOpenHrca ?? (() => {
    toast.success("HRCA Worksheet Opened", "Loading HRCA worksheet details...");
  });

  return (
    <div className={["flex flex-col gap-[18px]", className].filter(Boolean).join(" ")}>
      {/* 5-Why root cause analysis header card */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-ehs-normal-blue/10 text-ehs-normal-blue">
              <Icon icon="mdi:sitemap-outline" className="size-5 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <Text as="h3" className="text-ehs-dark-bg text-[14.8px] font-bold leading-snug">
                5-Why root cause analysis
              </Text>
              <span className="text-[11px] text-ehs-muted-text leading-normal break-words sm:truncate">
                Method: 5 Whys · Led by Sarah Mitchell · Linked to HRCA worksheet
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 sm:shrink-0 sm:justify-end justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-[#2563eb]/8 px-2.5 py-0.5 text-[10.5px] font-bold text-[#2563eb]">
              <span className="size-1.5 rounded-full bg-[#2563eb]" />
              In progress
            </span>
            <button
              type="button"
              onClick={handleOpenHrca}
              className="bg-ehs-normal-blue inline-flex items-center gap-1 rounded-[6px] px-3.5 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-ehs-normal-blue-hover shadow-[0px_4px_12px_-4px_#0891a6]"
            >
              <Icon icon="mdi:export" className="size-3.5" />
              <span>Open HRCA</span>
            </button>
          </div>
        </div>
      </IncidentGlassCard>

      {/* Why-chain mapping card */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-3 mb-4">
          <Text as="h3" className="text-ehs-dark-bg text-[14px] font-bold">
            Why-chain
          </Text>
          <span className="text-[11px] text-ehs-muted-text">
            Drill from event to root cause
          </span>
        </div>

        <div className="flex flex-col">
          {whyChain.map((item, index) => {
            const isRoot = item.isRootCause;
            return (
              <div key={item.step} className="relative flex gap-3.5">
                {/* Vertical timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none",
                      isRoot
                        ? "border-[#0891a6] bg-ehs-normal-blue text-white"
                        : "border-[rgba(15,23,42,0.12)] bg-white text-ehs-gray",
                    ].join(" ")}
                  >
                    {item.step}
                  </div>
                  {index < whyChain.length - 1 && (
                    <div className="my-1.5 min-h-[38px] w-px flex-1 bg-[rgba(15,23,42,0.08)]" />
                  )}
                </div>

                {/* Text blocks inside rounded boxes */}
                <div className="min-w-0 flex-1 pb-4 last:pb-2">
                  <div
                    className={[
                      "rounded-[10px] border p-3 text-left transition-all",
                      isRoot
                        ? "border-[#0891a6]/30 bg-[#0891a6]/5"
                        : "border-[rgba(15,23,42,0.06)] bg-white/42",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-[8.5px] font-bold tracking-[0.6px] uppercase inline-flex items-center gap-0.5",
                        isRoot ? "text-[#056e7e]" : "text-ehs-muted-text",
                      ].join(" ")}
                    >
                      {isRoot && <Icon icon="mdi:arrow-right" className="size-3" />}
                      {item.label}
                    </span>
                    <p
                      className={[
                        "text-[12px] mt-0.5 leading-relaxed",
                        isRoot ? "font-bold text-[#056e7e]" : "font-semibold text-ehs-dark-bg",
                      ].join(" ")}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </IncidentGlassCard>
    </div>
  );
}
