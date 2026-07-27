"use client";

import type { UpcomingFilingItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceUpcomingFilingsCardProps = Readonly<{
  filings: readonly UpcomingFilingItem[];
  className?: string;
}>;

export function RegulatoryComplianceUpcomingFilingsCard(
  props: RegulatoryComplianceUpcomingFilingsCardProps,
) {
  const { filings, className = "" } = props;

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[20px] border border-white/90 bg-white/70 p-5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <h3 className="text-[15px] font-bold text-[#0f172a] leading-tight">
          Upcoming filings
        </h3>
        <p className="text-[12px] font-medium text-[#94a3b8] mt-0.5">
          Next 90 days
        </p>
      </div>

      <div className="flex flex-col divide-y divide-[rgba(15,23,42,0.05)] text-[13px]">
        {filings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-semibold text-[#94a3b8] text-[12px] shrink-0">
                {item.date}
              </span>
              <span className="font-bold text-[#0f172a] truncate">
                {item.title}
              </span>
            </div>

            <span className="inline-flex rounded-md bg-[#e2e8f0]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#475569] shrink-0">
              {item.badgeLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
