"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Text } from "@/components/Text";
import type { IncidentRoutingMember } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  EMPTY_PEOPLE_PHOTO_INDEX,
  lookupPeoplePhoto,
  type PeoplePhotoIndex,
} from "@/components/incidents/detail/people/people-photos";
import { UserAvatar } from "@/components/ui/UserAvatar";

export type { IncidentRoutingMember };

export type IncidentDetailRoutingCardProps = Readonly<{
  members?: readonly IncidentRoutingMember[];
  /** Roster photos, keyed by name. */
  peoplePhotos?: PeoplePhotoIndex;
  className?: string;
}>;

export function IncidentDetailRoutingCard(
  props: Readonly<IncidentDetailRoutingCardProps>,
) {
  // Empty by default — never invent demo people when API data is absent.
  const {
    members = [],
    peoplePhotos = EMPTY_PEOPLE_PHOTO_INDEX,
    className = "",
  } = props;

  return (
    <IncidentGlassCard paddingClassName="p-4.75" className={className}>
      <div className="pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Routing & assignment
        </Text>
      </div>

      <div className="flex flex-col">
        {members.length === 0 ? (
          <EmptyState
            variant="plain"
            icon="mdi:call-split"
            title="No routing assignments"
            message="People this incident was routed to appear here."
            className="border-ehs-border-ink/8 border-t"
          />
        ) : null}
        {members.map((member) => (
          <div
            key={`${member.role}-${member.name}`}
            className="border-ehs-border-ink/8 flex items-center gap-2.5 border-t pt-2.75 pb-2.5"
          >
            <UserAvatar
              name={member.name}
              profileUrl={lookupPeoplePhoto(peoplePhotos, member.name)}
              sizeClassName="rounded-2.5 size-8"
              sizes="32px"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-muted-text text8 leading-normal font-bold tracking-wide uppercase">
                {member.role}
              </span>
              <span className="text-ehs-dark-bg text4 pt-px pb-0.5 leading-normal">
                {member.name}
              </span>
              {member.subtitle ? (
                <span className="text-ehs-muted-text text4 leading-normal">
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
