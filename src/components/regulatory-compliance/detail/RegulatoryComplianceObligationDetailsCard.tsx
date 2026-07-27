"use client";

import type { ComplianceObligationDetail } from "../regulatory-compliance-types";

export type RegulatoryComplianceObligationDetailsCardProps = Readonly<{
  detail: ComplianceObligationDetail;
  className?: string;
}>;

export function RegulatoryComplianceObligationDetailsCard(
  props: RegulatoryComplianceObligationDetailsCardProps,
) {
  const { detail, className = "" } = props;

  const isCompliant = detail.status === "Compliant";

  return (
    <div
      className={[
        "flex flex-col gap-6 rounded-[20px] border border-white/90 bg-white/70 p-6.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.05)] backdrop-blur-md max-w-[700px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-[18px] font-bold text-[#0f172a] leading-tight">
        Obligation Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Category
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.category}
          </span>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Due Date
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.dueDate}
          </span>
        </div>

        {/* Recurrence */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Recurrence
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.recurrence}
          </span>
        </div>

        {/* Responsible */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Responsible
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.responsible}
          </span>
        </div>

        {/* Regulatory Body */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Regulatory Body
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.regulatoryBody}
          </span>
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Priority
          </span>
          <span className="inline-flex rounded-md bg-[#e2e8f0]/80 px-2.5 py-0.5 text-[11px] font-bold text-[#475569]">
            {detail.priority}
          </span>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Status
          </span>
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

        {/* Completed Date */}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[#94a3b8]">
            Completed Date
          </span>
          <span className="text-[14px] font-bold text-[#0f172a]">
            {detail.completedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
