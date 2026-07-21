"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type IncidentDetailSummaryCardProps = Readonly<{
  summaryText?: string;
  className?: string;
}>;

export function IncidentDetailSummaryCard(
  props: Readonly<IncidentDetailSummaryCardProps>,
) {
  const {
    summaryText = "During second-shift operation, the high-pressure hose on press #4 ruptured at the coupling. Fluid was contained within the guarding; no operator contact occurred. The press was isolated under LOTO pending hose replacement. Maintenance dispatched within 30 minutes. No injuries reported.",
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[15px] font-bold"
      >
        Summary
      </Text>
      <p className="text-ehs-gray pt-3 text-[12px] leading-relaxed">
        {summaryText}
      </p>
    </IncidentGlassCard>
  );
}
