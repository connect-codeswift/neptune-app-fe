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
      className={[className, isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg text-lg font-semibold"
      >
        Summary
      </Text>
      {isEditing ? (
        <textarea
          value={summaryText}
          onChange={(event) => onChangeSummary?.(event.target.value)}
          rows={5}
          placeholder="Describe what happened…"
          className="min-h-[120px] w-full resize-y rounded-[12px] border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-3 text-sm leading-[20.8px] text-ehs-slate outline-none transition focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20"
        />
      ) : (
        <p className="text-sm leading-[20.8px] whitespace-pre-wrap text-ehs-slate">
          {summaryText.trim() || "No summary provided."}
        </p>
      )}
    </IncidentGlassCard>
  );
}
