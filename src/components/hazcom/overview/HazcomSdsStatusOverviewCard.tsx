import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { HazcomGlassCard, type HazcomBadgeTone } from "@/components/hazcom/shared";
import { HAZCOM_SDS_STATUS_ROWS } from "@/components/hazcom/overview/hazcom-overview-panel-data";
import {
  ehsButtonBaseClass,
  ehsButtonSecondaryClass,
  ehsButtonTertiaryClass,
} from "@/lib/ehs-classes";

const barClassByTone: Record<HazcomBadgeTone, string> = {
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-normal-blue",
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

const MAX_ROW_VALUE = Math.max(
  ...HAZCOM_SDS_STATUS_ROWS.map((row) => row.value),
  1,
);
const MIN_BAR_WIDTH_PERCENT = 4;

export type HazcomSdsStatusOverviewCardProps = Readonly<{
  className?: string;
}>;

export function HazcomSdsStatusOverviewCard(
  props: Readonly<HazcomSdsStatusOverviewCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text-ehs-darker text-base font-bold">
          SDS Status Overview
        </Text>
        <Link
          href="/dashboard/hazcom/sds"
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex items-center gap-0.5 text-xs font-semibold"
        >
          View SDS library
          <Icon icon="mdi:arrow-right" className="text-sm" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {HAZCOM_SDS_STATUS_ROWS.map((row) => {
          const widthPercent = Math.max(
            (row.value / MAX_ROW_VALUE) * 100,
            row.value > 0 ? MIN_BAR_WIDTH_PERCENT : 0,
          );

          return (
            <div key={row.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <Text as="span" className="text-ehs-gray text-sm">
                  {row.label}
                </Text>
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
              <div className="bg-ehs-dark-bg/8 relative h-1.5 overflow-hidden rounded-full">
                <div
                  className={[
                    "absolute top-0 left-0 h-full rounded-full transition-all",
                    barClassByTone[row.tone],
                  ].join(" ")}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/dashboard/hazcom/sds/upload"
          className={[ehsButtonBaseClass, ehsButtonSecondaryClass, "text-[13px]"].join(
            " ",
          )}
        >
          <Icon icon="mdi:upload" className="text-sm" aria-hidden="true" />
          Upload SDS
        </Link>
        <Link
          href="/dashboard/hazcom/risk-assessments"
          className={[ehsButtonBaseClass, ehsButtonTertiaryClass, "text-[13px]"].join(
            " ",
          )}
        >
          <Icon icon="mdi:chart-bar" className="text-sm" aria-hidden="true" />
          Reports
        </Link>
      </div>
    </HazcomGlassCard>
  );
}
