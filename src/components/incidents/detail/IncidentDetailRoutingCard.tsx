"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type IncidentRoutingMember = Readonly<{
  role: string;
  name: string;
  initials: string;
  subtitle?: string;
}>;

export type IncidentDetailRoutingCardProps = Readonly<{
  members?: readonly IncidentRoutingMember[];
  className?: string;
}>;

const DEFAULT_MEMBERS: readonly IncidentRoutingMember[] = [
  { role: "Reporter", name: "Maria Lopez", initials: "ML", subtitle: "EMP-04821" },
  { role: "Assignee", name: "Sarah Mitchell", initials: "SM", subtitle: "EHS Manager" },
  { role: "Watchers", name: "Alicia Chen +2", initials: "AC", subtitle: "Site Supervisor" },
];

export function IncidentDetailRoutingCard(
  props: Readonly<IncidentDetailRoutingCardProps>,
) {
  const { members = DEFAULT_MEMBERS, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[15px] font-bold"
      >
        Routing & assignment
      </Text>

      <div className="flex flex-col">
        {members.map((member, index) => (
          <div
            key={member.role}
            className={[
              "flex items-center gap-3 py-3",
              index === members.length - 1
                ? "pb-1"
                : "border-b border-[rgba(15,23,42,0.05)]",
            ].join(" ")}
          >
            <div className="bg-ehs-normal-blue/14 flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#056e7e]">
              {member.initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-[0.6px] uppercase">
                {member.role}
              </span>
              <span className="text-ehs-dark-bg text-[13px] leading-snug font-bold">
                {member.name}
              </span>
              {member.subtitle && (
                <span className="text-ehs-gray text-[11px] leading-normal">
                  {member.subtitle}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
