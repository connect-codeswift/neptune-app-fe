"use client";

import { EmptyState } from "@/components/ui/EmptyState";

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
    <IncidentGlassCard paddingClassName="p-4.75" className={className}>
      <div className="pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Notifications sent
        </Text>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:bell-outline"
          title="No notifications"
          message="Notifications sent for this incident appear here."
          className="border-ehs-border-ink/8 border-t"
        />
      ) : null}

      {notifications.map((notif, index) => (
        <div
          key={`${notif.target}-${notif.time}-${String(index)}`}
          className="border-ehs-border-ink/8 flex items-center gap-2.5 border-t pt-2.5 pb-2.25"
        >
          <div className="text-ehs-gray bg-ehs-surface/82 flex size-7 shrink-0 items-center justify-center rounded-lg">
            <Icon icon={notif.icon} className="size-3.25" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-ehs-dark-bg text4 leading-normal">
              {notif.target}
            </span>
            <span className="text-ehs-muted-text text4 truncate leading-normal">
              {notif.channel}
            </span>
          </div>
          <span className="text-ehs-muted-text text4 shrink-0 leading-normal">
            {notif.time}
          </span>
        </div>
      ))}
    </IncidentGlassCard>
  );
}
