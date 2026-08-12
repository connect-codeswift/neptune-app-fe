"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_TEXTAREA_CLASS } from "@/components/ui/field-styles";

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
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.25"
      className={[className, isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg text3"
      >
        Summary
      </Text>
      {isEditing ? (
        <textarea
          value={summaryText}
          onChange={(event) => onChangeSummary?.(event.target.value)}
          rows={5}
          placeholder="Describe what happened…"
          className={FIELD_TEXTAREA_CLASS}
        />
      ) : (
        <p className="text4 leading-[20.8px] whitespace-pre-wrap text-ehs-slate">
          {summaryText.trim() || "No summary provided."}
        </p>
      )}
    </IncidentGlassCard>
  );
}
