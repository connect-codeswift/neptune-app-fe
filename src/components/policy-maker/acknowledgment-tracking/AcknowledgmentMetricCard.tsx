"use client";

import { Text } from "@/components/Text";
import type { AcknowledgmentTrackingMetric } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export type AcknowledgmentMetricCardProps = Readonly<{
  metric: AcknowledgmentTrackingMetric;
  className?: string;
}>;

/**
 * Centered metric tile (Figma 5568:25500) — value above label.
 */
export function AcknowledgmentMetricCard(
  props: Readonly<AcknowledgmentMetricCardProps>,
) {
  const { metric, className = "" } = props;

  return (
    <div
      className={[
        "relative flex h-[86px] min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] px-[16.8px] pt-[16.8px] pb-[16.8px] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="p"
        className="relative z-1 text-center text-[22px] leading-8 font-bold text-[#0b1320] sm:text-[24px] sm:leading-8"
      >
        {metric.value}
      </Text>
      <Text
        as="p"
        className="relative z-1 text-center text-[12px] leading-4 text-[#566072]"
      >
        {metric.label}
      </Text>
    </div>
  );
}
