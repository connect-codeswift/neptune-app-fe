"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

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

const DEFAULT_NOTIFICATIONS: readonly NotificationRow[] = [
  {
    target: "On-call EHS lead",
    channel: "Page + SMS",
    time: "09:10",
    icon: "mdi:cellphone-message",
  },
  {
    target: "Site Supervisor",
    channel: "Email",
    time: "09:18",
    icon: "mdi:email-outline",
  },
  {
    target: "Plant Manager",
    channel: "Email",
    time: "09:35",
    icon: "mdi:email-outline",
  },
];

export function IncidentDetailNotificationsCard(
  props: Readonly<IncidentDetailNotificationsCardProps>,
) {
  const { notifications = DEFAULT_NOTIFICATIONS, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[15px] font-bold"
      >
        Notifications sent
      </Text>

      <div className="flex flex-col pt-1">
        {notifications.map((notif, index) => (
          <div
            key={notif.target}
            className={[
              "flex items-center justify-between gap-3 py-3",
              index === notifications.length - 1
                ? "pb-1"
                : "border-b border-[rgba(15,23,42,0.05)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(15,23,42,0.04)] text-ehs-gray">
                <Icon icon={notif.icon} className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-ehs-dark-bg leading-snug">
                  {notif.target}
                </span>
                <span className="text-[11px] text-ehs-gray truncate leading-normal">
                  {notif.channel}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-ehs-muted-text shrink-0">
              {notif.time}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
