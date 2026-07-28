"use client";

import Link from "next/link";
import type { ComplianceObligationDetail } from "../regulatory-compliance-types";

export type RegulatoryComplianceDetailBannerCardProps = Readonly<{
  detail: ComplianceObligationDetail;
  onMarkAsComplete?: () => void;
  className?: string;
}>;

export function RegulatoryComplianceDetailBannerCard(
  props: RegulatoryComplianceDetailBannerCardProps,
) {
  const { detail, onMarkAsComplete, className = "" } = props;

  const isCompliant = detail.status === "Compliant";

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-[20px] border border-white/90 bg-white/70 p-6 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748b]">
          <Link
            href="/dashboard/regulatory-compliance"
            className="hover:text-[#0f172a] hover:underline"
          >
            Compliance
          </Link>
          <span>&gt;</span>
          <span className="font-bold text-[#64748b]">{detail.code}</span>
        </div>

        {/* Title + Status Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[22px] font-bold leading-tight text-[#0f172a]">
            {detail.title}
          </h1>

          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[12px] font-bold",
              isCompliant
                ? "bg-[#e6f4ea] text-[#137333]"
                : "bg-[#e2e8f0]/80 text-[#475569]",
            ].join(" ")}
          >
            <span
              className={[
                "size-2 rounded-full",
                isCompliant ? "bg-[#137333]" : "bg-[#475569]",
              ].join(" ")}
            />
            {detail.status}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[13px] font-medium text-[#94a3b8]">
          {detail.subtitle}
        </p>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onMarkAsComplete}
        className={[
          "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-xs transition-all shrink-0",
          isCompliant
            ? "bg-[#64748b] hover:bg-[#475569]"
            : "bg-[#10b981] hover:bg-[#059669]",
        ].join(" ")}
      >
        {isCompliant ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  );
}
