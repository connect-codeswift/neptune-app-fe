"use client";

import { Text } from "@/components/Text";
import type { IncidentRoutingMember } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { IncidentRoutingMember };

export type IncidentDetailRoutingCardProps = Readonly<{
  members?: readonly IncidentRoutingMember[];
  className?: string;
}>;

export function IncidentDetailRoutingCard(
  props: Readonly<IncidentDetailRoutingCardProps>,
) {
  // Empty by default — never invent demo people when API data is absent.
  const { members = [], className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      className={className}
    >
      <div className="pb-[14px]">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-[14px] leading-normal font-bold tracking-[-0.14px]"
        >
          Routing & assignment
        </Text>
      </div>

      <div className="flex flex-col">
        {members.length === 0 ? (
          <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-[12px]">
            No routing assignments returned by the API.
          </div>
        ) : null}
        {members.map((member) => (
          <div
            key={`${member.role}-${member.name}`}
            className="flex items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px]"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(8,145,166,0.18)] text-[11px] font-bold text-[#056e7e]">
              {member.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[10px] leading-normal font-bold tracking-[0.8px] text-[#8892a3] uppercase">
                {member.role}
              </span>
              <span className="pt-px pb-0.5 text-[13px] leading-normal text-[#0b1320]">
                {member.name}
              </span>
              {member.subtitle ? (
                <span className="text-[11px] leading-normal text-[#8892a3]">
                  {member.subtitle}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
