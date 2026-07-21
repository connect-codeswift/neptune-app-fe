"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type HierarchyControlRow = Readonly<{
  label: string;
  count: number;
}>;

export type IncidentDetailCapaControlCoverageCardProps = Readonly<{
  hierarchyControls?: readonly HierarchyControlRow[];
  noticeMessage?: string;
  className?: string;
}>;

const DEFAULT_HIERARCHY: readonly HierarchyControlRow[] = [
  { label: "Elimination", count: 0 },
  { label: "Substitution", count: 1 },
  { label: "Engineering Controls", count: 1 },
  { label: "Administrative Controls", count: 1 },
  { label: "PPE", count: 0 },
];

const DEFAULT_NOTICE =
  "No elimination control yet. Consider retiring or redesigning Press #4 to remove the hazard at source.";

export function IncidentDetailCapaControlCoverageCard(
  props: Readonly<IncidentDetailCapaControlCoverageCardProps>,
) {
  const {
    hierarchyControls = DEFAULT_HIERARCHY,
    noticeMessage = DEFAULT_NOTICE,
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-2.5">
        <Text as="h3" className="text-ehs-dark-bg text-[14.8px] font-bold">
          Control coverage
        </Text>
        <span className="text-[11px] text-ehs-muted-text">
          Across hierarchy of controls
        </span>
      </div>

      {/* List of 5 Hierarchy levels */}
      <div className="flex flex-col gap-2.5 pt-3.5">
        {hierarchyControls.map((ctrl) => (
          <div
            key={ctrl.label}
            className="flex items-center justify-between text-[12px] font-semibold text-ehs-dark-bg"
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-[2px] bg-slate-400" />
              <span>{ctrl.label}</span>
            </div>
            <span
              className={
                ctrl.count > 0
                  ? "font-bold text-ehs-dark-bg"
                  : "text-ehs-muted-text font-medium"
              }
            >
              {ctrl.count}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Notice Callout Box */}
      {noticeMessage && (
        <div className="mt-4 rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-slate-100/70 p-3.5 text-left text-[11px] leading-relaxed text-slate-700 shadow-sm">
          <span className="font-bold text-ehs-dark-bg">
            No elimination control yet.
          </span>{" "}
          Consider retiring or redesigning Press #4 to remove the hazard at
          source.
        </div>
      )}
    </IncidentGlassCard>
  );
}
