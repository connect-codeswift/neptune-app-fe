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
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
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
            <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue flex size-8 shrink-0 items-center justify-center rounded-[10px] text-sm font-bold">
              {member.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-muted-text text-xs leading-normal font-bold tracking-wide uppercase">
                {member.role}
              </span>
              <span className="text-ehs-dark-bg pt-px pb-0.5 text-sm leading-normal">
                {member.name}
              </span>
              {member.subtitle ? (
                <span className="text-ehs-muted-text text-sm leading-normal">
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
