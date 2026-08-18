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
      paddingClassName="p-4.75"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-0.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Control coverage
        </Text>
        <span className="text4 text-ehs-muted-text leading-normal">
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
                isFirst ? "pt-5.5 pb-2" : isLast ? "pt-2 pb-4.5" : "py-2",
              ].join(" ")}
            >
              <span className="rounded-0.75 bg-ehs-gray size-2.5 shrink-0" />
              <span className="text4 text-ehs-slate min-w-0 flex-1 leading-normal">
                {ctrl.label}
              </span>
              <span
                className={[
                  "text5 shrink-0",
                  isLoading
                    ? "text-ehs-muted-text"
                    : ctrl.count > 0
                      ? "text-ehs-dark-bg"
                      : "text-ehs-muted-text",
                ].join(" ")}
              >
                {isLoading ? "—" : ctrl.count}
              </span>
            </div>
          );
        })}
      </div>

      {!isLoading && noticeMessage ? (
        <div className="rounded-2.5 bg-ehs-dark-bg/14 text8 text-ehs-slate border border-[rgba(11,19,32,0.35)] px-3.25 pt-3 pb-3.25 leading-[16.5px]">
          <span className="font-bold">{noticeLead}</span> {noticeRest}
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
