"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type NotificationRow = Readonly<{
  target: string;
  channel: string;
  time: string;
  icon: string;
}>;

export type IncidentDetailNotificationsCardProps = Readonly<{
  notifications?: readonly NotificationRow[];
  className?: string;
}>;

export function IncidentDetailNotificationsCard(
  props: Readonly<IncidentDetailNotificationsCardProps>,
) {
  // No placeholder rows. Under the heading "Notifications sent", sample
  // entries claim people were paged or emailed when they were not — the MOCK:
  // prefix made that visible to us, not to whoever is reading the record.
  const { notifications = [], className = "" } = props;

  return (
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="pb-[14px]">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Notifications sent
        </Text>
      </div>

      {notifications.length === 0 ? (
        <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] pt-[10px] pb-[9px] text-sm">
          No notifications recorded for this incident.
        </div>
      ) : null}

      {notifications.map((notif, index) => (
        <div
          key={`${notif.target}-${notif.time}-${String(index)}`}
          className="flex items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[10px] pb-[9px]"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.82)] text-ehs-gray">
            <Icon
              icon={notif.icon}
              className="size-[13px]"
              aria-hidden="true"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm leading-normal text-ehs-dark-bg">
              {notif.target}
            </span>
            <span className="truncate text-sm leading-normal text-ehs-muted-text">
              {notif.channel}
            </span>
          </div>
          <span className="shrink-0 text-sm leading-normal text-ehs-muted-text">
            {notif.time}
          </span>
        </div>
      ))}
    </IncidentGlassCard>
  );
}
