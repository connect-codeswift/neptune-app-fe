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

const DEFAULT_NOTIFICATIONS: readonly NotificationRow[] = [
  {
    target: "MOCK: On-call EHS lead",
    channel: "Page + SMS",
    time: "09:18",
    icon: "mdi:bell-outline",
  },
  {
    target: "MOCK: Site Supervisor",
    channel: "Email",
    time: "09:18",
    icon: "mdi:bell-outline",
  },
  {
    target: "MOCK: Plant Manager",
    channel: "Email",
    time: "09:35",
    icon: "mdi:bell-outline",
  },
];

export function IncidentDetailNotificationsCard(
  props: Readonly<IncidentDetailNotificationsCardProps>,
) {
  const { notifications = DEFAULT_NOTIFICATIONS, className = "" } = props;

  return (
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="pb-[14px]">
        <Text
          as="h3"
          className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          Notifications sent
        </Text>
      </div>

      {notifications.map((notif, index) => (
        <div
          key={`${notif.target}-${notif.time}-${String(index)}`}
          className="flex items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[10px] pb-[9px]"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.82)] text-[#566072]">
            <Icon
              icon={notif.icon}
              className="size-[13px]"
              aria-hidden="true"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[12px] leading-normal text-[#0b1320]">
              {notif.target}
            </span>
            <span className="truncate text-[11px] leading-normal text-[#8892a3]">
              {notif.channel}
            </span>
          </div>
          <span className="shrink-0 text-[11px] leading-normal text-[#8892a3]">
            {notif.time}
          </span>
        </div>
      ))}
    </IncidentGlassCard>
  );
}
