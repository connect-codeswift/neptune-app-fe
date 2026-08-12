"use client";

export const complianceGlassCardClass =
  "rounded-4.75 border border-white/90 bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-2.5";

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
        "inline-flex h-[20.244px] items-center rounded-full border border-white/50 bg-[rgba(11,19,32,0.14)] px-2.25 text-2.5 leading-3.75 font-bold tracking-[0.21px] whitespace-nowrap text-[#566072]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
