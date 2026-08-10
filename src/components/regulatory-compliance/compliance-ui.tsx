"use client";

import { SHOW_KPI_TREND_BADGES } from "@/lib/kpi-display-flags";

export const complianceGlassCardClass =
  "rounded-[19px] border border-white/90 bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px]";

export type CompliancePillProps = Readonly<{
  label: string;
  className?: string;
}>;

export function CompliancePill(props: CompliancePillProps) {
  const { label, className = "" } = props;

  return (
    <span
      className={[
        // Hairline for the frosted read; no backdrop-blur on per-row chips
        // (see IncidentBadge for the rationale).
        "inline-flex h-[20.244px] items-center rounded-full border border-white/50 bg-[rgba(11,19,32,0.14)] px-[9px] text-[10px] leading-[15px] font-bold tracking-[0.21px] whitespace-nowrap text-[#566072]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}

export type ComplianceDeltaBadgeProps = Readonly<{
  value: string;
  tone: "green" | "danger" | "coral";
}>;

export function ComplianceDeltaBadge(props: ComplianceDeltaBadgeProps) {
  const { value, tone } = props;

  if (!SHOW_KPI_TREND_BADGES || !value.trim()) {
    return null;
  }

  const isDanger = tone === "danger" || tone === "coral";

  return (
    <span
      className={[
        "inline-flex h-[20.244px] items-center rounded-full px-[9px] text-[10px] leading-[15px] font-bold tracking-[0.21px] whitespace-nowrap",
        isDanger
          ? "bg-[rgba(239,68,68,0.14)] text-[#ef4444]"
          : "bg-[rgba(16,185,129,0.14)] text-[#10b981]",
      ].join(" ")}
    >
      {value}
    </span>
  );
}
