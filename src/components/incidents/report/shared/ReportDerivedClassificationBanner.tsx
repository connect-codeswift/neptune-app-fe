"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  dartForSeverity,
  oshaRecordableForSeverity,
  siaForSeverity,
  sifForIntake,
  type ClassificationValue,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportDerivedClassificationBannerProps = Readonly<{
  severity: string;
  /** SIP answer from step 4 — empty until answered. */
  sipAnswer?: ClassificationValue;
  className?: string;
}>;

/**
 * Read-only banner for steps 3–5: initial classification derived from severity
 * plus SIA / SIP / SIF. SIP is the only human judgment (asked on step 4); SIA
 * and SIF are never pickers.
 */
export function ReportDerivedClassificationBanner(
  props: Readonly<ReportDerivedClassificationBannerProps>,
) {
  const { severity, sipAnswer = "", className = "" } = props;

  const oshaRecordable = oshaRecordableForSeverity(severity) || "—";
  const dart = dartForSeverity(severity) || "—";
  const sia = siaForSeverity(severity) || "—";
  const sip = sipAnswer || "—";
  const sif = sifForIntake(severity, sipAnswer) || "—";

  return (
    <div
      className={[
        "border-ehs-border bg-ehs-light-bg flex items-start gap-3 rounded-[12px] border p-3.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-ehs-normal-blue bg-ehs-normal-blue/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px]">
        <Icon icon="mdi:shield-check-outline" className="size-3.5" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="span" className="text-ehs-dark-blue text-sm font-bold">
          Initial classification
        </Text>
        <p className="text-ehs-gray text-xs leading-normal">
          OSHA Recordable — {oshaRecordable} · DART — {dart} · SIA — {sia} · SIP
          — {sip} · SIF — {sif}. Confirmed by EHS after investigation.
        </p>
      </div>
    </div>
  );
}
