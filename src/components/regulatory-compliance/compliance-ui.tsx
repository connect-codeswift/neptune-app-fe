"use client";

export const complianceGlassCardClass =
  "rounded-4.75 border border-ehs-hairline/90 bg-ehs-surface/62 shadow-(--ehs-shadow-card-flat) backdrop-blur-2.5";

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
        "text7 text-ehs-gray inline-flex h-5 items-center rounded-full border border-ehs-hairline/50 bg-ehs-surface-inverse/14 px-2.25 whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
