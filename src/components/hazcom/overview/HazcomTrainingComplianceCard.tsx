import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  HazcomGlassCard,
  type HazcomBadgeTone,
} from "@/components/hazcom/shared";
import { HAZCOM_TRAINING_COMPLIANCE_ROWS } from "@/components/hazcom/overview/hazcom-overview-panel-data";

const dotClassByTone: Record<HazcomBadgeTone, string> = {
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-dark-blue",
  muted: "bg-ehs-gray",
  danger: "bg-ehs-red",
  warn: "bg-ehs-yellow",
  success: "bg-ehs-green",
};

const valueClassByTone: Record<HazcomBadgeTone, string> = {
  neutral: "text-ehs-darker",
  teal: "text-ehs-dark-blue",
  muted: "text-ehs-darker",
  danger: "text-ehs-red",
  warn: "text-ehs-yellow",
  success: "text-ehs-green",
};

export type HazcomTrainingComplianceCardProps = Readonly<{
  className?: string;
}>;

export function HazcomTrainingComplianceCard(
  props: Readonly<HazcomTrainingComplianceCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text-ehs-darker text-base font-bold">
          Training Compliance
        </Text>
        <Link
          href="/dashboard/hazcom/training"
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex items-center gap-0.5 text-xs font-semibold"
        >
          View all
          <Icon icon="mdi:arrow-right" className="text-sm" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-ehs-border mt-4 flex flex-col divide-y">
        {HAZCOM_TRAINING_COMPLIANCE_ROWS.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-2">
              <span
                className={[
                  "size-2 shrink-0 rounded-full",
                  dotClassByTone[row.tone],
                ].join(" ")}
                aria-hidden="true"
              />
              <Text as="span" className="text-ehs-darker text-sm">
                {row.label}
              </Text>
            </span>
            <Text
              as="span"
              className={[
                "text-sm font-bold tabular-nums",
                valueClassByTone[row.tone],
              ].join(" ")}
            >
              {String(row.value)}
            </Text>
          </div>
        ))}
      </div>
    </HazcomGlassCard>
  );
}
