"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { HazcomBadgeTone } from "@/components/hazcom/shared";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { HazcomOverviewState } from "@/hooks/use-hazcom-overview";

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

type ComplianceRow = Readonly<{
  id: string;
  label: string;
  value: number;
  tone: HazcomBadgeTone;
}>;

export type HazcomTrainingComplianceCardProps = Readonly<{
  overview: HazcomOverviewState;
  className?: string;
}>;

/** Training compliance from GET /api/hazcom/dashboard/training-compliance. */
export function HazcomTrainingComplianceCard(
  props: Readonly<HazcomTrainingComplianceCardProps>,
) {
  const { overview, className = "" } = props;
  const { trainingCompliance } = overview;

  const rows: readonly ComplianceRow[] =
    trainingCompliance === null
      ? []
      : [
          {
            id: "compliant",
            label: "Compliant",
            value: trainingCompliance.compliant,
            tone: "success",
          },
          {
            id: "due-soon",
            label: "Due Soon",
            value: trainingCompliance.dueSoon,
            tone: "muted",
          },
          {
            id: "overdue",
            label: "Overdue",
            value: trainingCompliance.overdue,
            tone: "danger",
          },
          {
            id: "never-trained",
            label: "Never Trained",
            value: trainingCompliance.neverTrained,
            tone: "muted",
          },
        ];

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text3 text-ehs-darker">
          Training Compliance
        </Text>
        <Link
          href="/dashboard/hazcom/training"
          className="text7 text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-dark-bg rounded-2.5 inline-flex items-center gap-2 px-2 py-1 transition-colors"
        >
          View all
          <Icon
            icon="mdi:arrow-right"
            className="size-3 shrink-0"
            aria-hidden
          />
        </Link>
      </div>

      {trainingCompliance === null ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Icon
            icon="mdi:account-school-outline"
            className="text-ehs-muted-text size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text4 text-ehs-muted-text">
            No training compliance.
          </Text>
        </div>
      ) : (
        <div className="divide-ehs-border mt-4 flex flex-col divide-y">
          {rows.map((row) => (
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
                <Text as="span" className="text4 text-ehs-darker">
                  {row.label}
                </Text>
              </span>
              <Text
                as="span"
                className={[
                  "text5 tabular-nums",
                  valueClassByTone[row.tone],
                ].join(" ")}
              >
                {String(row.value)}
              </Text>
            </div>
          ))}
        </div>
      )}
    </IncidentGlassCard>
  );
}
