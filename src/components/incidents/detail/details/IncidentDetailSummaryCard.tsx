"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type IncidentDetailSummaryCardProps = Readonly<{
  summaryText?: string;
  isEditing?: boolean;
  onChangeSummary?: (value: string) => void;
  className?: string;
}>;

export function IncidentDetailSummaryCard(
  props: Readonly<IncidentDetailSummaryCardProps>,
) {
  const {
    summaryText = "",
    isEditing = false,
    onChangeSummary,
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-[13px]"
      className={[className, isEditing ? "ring-1 ring-[#0891a6]/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
      >
        Summary
      </Text>
      {isEditing ? (
        <textarea
          value={summaryText}
          onChange={(event) => onChangeSummary?.(event.target.value)}
          rows={5}
          placeholder="Describe what happened…"
          className="min-h-[120px] w-full resize-y rounded-[12px] border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-3 text-[13px] leading-[20.8px] text-[#2a3446] outline-none transition focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
        />
      ) : (
        <p className="text-[13px] leading-[20.8px] whitespace-pre-wrap text-[#2a3446]">
          {summaryText.trim() || "No summary provided."}
        </p>
      )}
    </IncidentGlassCard>
  );
}
