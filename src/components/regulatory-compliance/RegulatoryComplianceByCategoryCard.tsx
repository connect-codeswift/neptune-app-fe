"use client";

import type { ComplianceCategoryProgress } from "./regulatory-compliance-types";

export type RegulatoryComplianceByCategoryCardProps = Readonly<{
  categories: readonly ComplianceCategoryProgress[];
  className?: string;
}>;

export function RegulatoryComplianceByCategoryCard(
  props: RegulatoryComplianceByCategoryCardProps,
) {
  const { categories, className = "" } = props;

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
          By Category
        </h3>
        <p className="text-[12px] font-medium text-[#94a3b8] mt-0.5">
          Compliance posture
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {categories.map((cat) => {
          const percent = Math.min(
            100,
            Math.max(0, Math.round((cat.current / cat.total) * 100)),
          );

          return (
            <div key={cat.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-bold text-[#0f172a]">{cat.category}</span>
                <span className="font-semibold text-[#64748b] text-[12px]">
                  {`${cat.current}/${cat.total}`}
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-2 w-full rounded-full bg-[#e2e8f0]/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: cat.colorHex,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
