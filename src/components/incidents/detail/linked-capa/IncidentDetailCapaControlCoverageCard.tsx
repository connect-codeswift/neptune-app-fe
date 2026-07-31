"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { HierarchyControlRow } from "@/components/incidents/detail/linked-capa/capa-types";
import { CAPA_CONTROL_LEVELS } from "@/services/mappers/capa.mapper";

export type { HierarchyControlRow };

export type IncidentDetailCapaControlCoverageCardProps = Readonly<{
  hierarchyControls?: readonly HierarchyControlRow[];
  noticeMessage?: string | null;
  isLoading?: boolean;
  className?: string;
}>;

const EMPTY_HIERARCHY: readonly HierarchyControlRow[] = CAPA_CONTROL_LEVELS.map(
  (label) => ({ label, count: 0 }),
);

export function IncidentDetailCapaControlCoverageCard(
  props: Readonly<IncidentDetailCapaControlCoverageCardProps>,
) {
  const {
    hierarchyControls = EMPTY_HIERARCHY,
    noticeMessage = null,
    isLoading = false,
    className = "",
  } = props;

  const noticeLead = "No elimination control yet.";
  const noticeRest =
    noticeMessage && noticeMessage.startsWith(noticeLead)
      ? noticeMessage.slice(noticeLead.length).trim()
      : (noticeMessage ?? "");

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          Control coverage
        </Text>
        <span className="text-[11px] leading-normal text-[#8892a3]">
          Across hierarchy of controls
        </span>
      </div>

      <div className="flex flex-col">
        {hierarchyControls.map((ctrl, index) => {
          const isFirst = index === 0;
          const isLast = index === hierarchyControls.length - 1;

          return (
            <div
              key={ctrl.label}
              className={[
                "flex items-center gap-2.5",
                isFirst
                  ? "pt-[22px] pb-2"
                  : isLast
                    ? "pt-2 pb-[18px]"
                    : "py-2",
              ].join(" ")}
            >
              <span className="size-2.5 shrink-0 rounded-[3px] bg-[#566072]" />
              <span className="min-w-0 flex-1 text-[12px] leading-normal text-[#2a3446]">
                {ctrl.label}
              </span>
              <span
                className={[
                  "shrink-0 text-[12px] font-bold",
                  isLoading
                    ? "text-[#b3bbc8]"
                    : ctrl.count > 0
                      ? "text-[#0b1320]"
                      : "text-[#b3bbc8]",
                ].join(" ")}
              >
                {isLoading ? "—" : ctrl.count}
              </span>
            </div>
          );
        })}
      </div>

      {!isLoading && noticeMessage ? (
        <div className="rounded-[10px] border border-[rgba(11,19,32,0.35)] bg-[rgba(11,19,32,0.14)] px-[13px] pt-[12px] pb-[13px] text-[10.8px] leading-[16.5px] text-[#2a3446]">
          <span className="font-bold">{noticeLead}</span>{" "}
          {noticeRest}
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
