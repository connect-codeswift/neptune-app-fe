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
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Routing & assignment
        </Text>
      </div>

      <div className="flex flex-col">
        {members.length === 0 ? (
          <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-sm">
            No routing assignments returned by the API.
          </div>
        ) : null}
        {members.map((member) => (
          <div
            key={`${member.role}-${member.name}`}
            className="flex items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px]"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-ehs-dark-blue-bg-light text-sm font-bold text-ehs-dark-blue">
              {member.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs leading-normal font-bold tracking-wide text-ehs-muted-text uppercase">
                {member.role}
              </span>
              <span className="pt-px pb-0.5 text-sm leading-normal text-ehs-dark-bg">
                {member.name}
              </span>
              {member.subtitle ? (
                <span className="text-sm leading-normal text-ehs-muted-text">
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
