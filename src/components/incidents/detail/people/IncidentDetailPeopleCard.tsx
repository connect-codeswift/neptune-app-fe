"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type ResponderMember = Readonly<{
  role: string;
  name: string;
  initials: string;
  empId: string;
  badgeLabel: string;
  badgeTone: "teal" | "green" | "gray" | "blue";
}>;

export type IncidentDetailPeopleCardProps = Readonly<{
  affectedName?: string;
  affectedRole?: string;
  affectedEmpId?: string;
  bodyPart?: string;
  treatment?: string;
  daysAway?: string | number;
  responders?: readonly ResponderMember[];
  className?: string;
}>;

const DEFAULT_RESPONDERS: readonly ResponderMember[] = [
  {
    role: "EHS Manager - Assignee",
    name: "Sarah Mitchell",
    initials: "SM",
    empId: "EMP-00214",
    badgeLabel: "Lead",
    badgeTone: "teal",
  },
  {
    role: "Maintenance",
    name: "Mike Reyes",
    initials: "MR",
    empId: "EMP-03110",
    badgeLabel: "LOTO",
    badgeTone: "green",
  },
  {
    role: "Site Supervisor",
    name: "Alicia Chen",
    initials: "AC",
    empId: "EMP-00891",
    badgeLabel: "Watcher",
    badgeTone: "blue",
  },
];

export function IncidentDetailPeopleCard(
  props: Readonly<IncidentDetailPeopleCardProps>,
) {
  const {
    affectedName = "Maria Lopez",
    affectedRole = "Affected / Operator - Plant A - Press",
    affectedEmpId = "EMP-04821",
    bodyPart = "—",
    treatment = "None required",
    daysAway = 0,
    responders = DEFAULT_RESPONDERS,
    className = "",
  } = props;

  const toneClass = (tone: string) => {
    if (tone === "teal") return "bg-[#0891a6]/10 text-[#056e7e]";
    if (tone === "green") return "bg-[#10b981]/10 text-[#0f766e]";
    if (tone === "blue") return "bg-[#2563eb]/10 text-[#1d4ed8]";
    return "bg-[rgba(15,23,42,0.06)] text-ehs-gray";
  };

  return (
    <div className={["flex flex-col gap-[18px]", className].filter(Boolean).join(" ")}>
      {/* Affected Person Card */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <Text as="h3" className="text-ehs-dark-bg pb-2.5 text-[15px] font-bold border-b border-[rgba(15,23,42,0.06)]">
          Affected person
        </Text>

        <div className="flex items-center justify-between gap-3 pt-3.5">
          <div className="flex items-center gap-3">
            <div className="bg-ehs-normal-blue/14 flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#056e7e]">
              ML
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-ehs-dark-bg leading-snug">
                {affectedName}
              </span>
              <span className="text-[11px] text-ehs-gray leading-normal truncate">
                {affectedRole}
              </span>
              <span className="text-[10px] text-ehs-muted-text">{affectedEmpId}</span>
            </div>
          </div>
          <span className="rounded-[6px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-[10px] font-bold tracking-[0.2px] text-ehs-gray shrink-0">
            No Injury
          </span>
        </div>

        {/* 3 Metric Boxes */}
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
          <div className="rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-3 text-left">
            <span className="text-[9px] font-bold text-ehs-muted-text uppercase tracking-[0.6px]">
              Body Part
            </span>
            <p className="text-[12.5px] font-bold text-ehs-dark-bg mt-0.5">
              {bodyPart}
            </p>
          </div>

          <div className="rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-3 text-left">
            <span className="text-[9px] font-bold text-ehs-muted-text uppercase tracking-[0.6px]">
              Treatment
            </span>
            <p className="text-[12.5px] font-bold text-ehs-dark-bg mt-0.5">
              {treatment}
            </p>
          </div>

          <div className="rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/42 p-3 text-left">
            <span className="text-[9px] font-bold text-ehs-muted-text uppercase tracking-[0.6px]">
              Days Away
            </span>
            <p className="text-[12.5px] font-bold text-ehs-dark-bg mt-0.5">
              {daysAway}
            </p>
          </div>
        </div>
      </IncidentGlassCard>

      {/* Responders & Assignees Card */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-2.5">
          <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
            Responders & assignees
          </Text>
          <span className="text-[11px] text-ehs-muted-text">
            {responders.length} people
          </span>
        </div>

        <div className="flex flex-col pt-1">
          {responders.map((person, index) => (
            <div
              key={person.empId}
              className={[
                "flex items-center justify-between gap-3 py-3",
                index === responders.length - 1
                  ? "pb-1"
                  : "border-b border-[rgba(15,23,42,0.05)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-ehs-normal-blue/14 flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#056e7e]">
                  {person.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-ehs-dark-bg leading-snug">
                    {person.name}
                  </span>
                  <span className="text-[11px] text-ehs-gray truncate leading-normal">
                    {person.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[10px] font-semibold text-ehs-muted-text">
                  {person.empId}
                </span>
                <span
                  className={[
                    "rounded-[6px] px-2.5 py-0.5 text-[9.5px] font-bold tracking-[0.2px]",
                    toneClass(person.badgeTone),
                  ].join(" ")}
                >
                  {person.badgeLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </IncidentGlassCard>
    </div>
  );
}
