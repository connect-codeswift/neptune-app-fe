"use client";

import type { ComplianceKpiItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceKpiGridProps = Readonly<{
  items: readonly ComplianceKpiItem[];
  className?: string;
}>;

export function RegulatoryComplianceKpiGrid(
  props: RegulatoryComplianceKpiGridProps,
) {
  const { items, className = "" } = props;

  return (
    <div
      className={[
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((kpi) => {
        const isCoral = kpi.badgeTone === "coral";
        return (
          <div
            key={kpi.id}
            className="flex min-w-0 flex-col justify-between gap-3 rounded-[18px] border border-white/90 bg-white/70 p-4.5 shadow-[0px_8px_24px_0px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all hover:bg-white/80"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-[0.06em] text-[#64748b] uppercase">
                {kpi.label}
              </span>
              <span
                className={[
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                  isCoral
                    ? "bg-[#fce8e6] text-[#c5221f]"
                    : "bg-[#e6f4ea] text-[#137333]",
                ].join(" ")}
              >
                {kpi.badgeValue}
              </span>
            </div>

            <div className="text-[34px] leading-none font-bold tracking-tight text-[#0f172a]">
              {kpi.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
