"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type TimelineEvent = Readonly<{
  id: string;
  title: string;
  description: string;
  time: string;
  actorName: string;
  actorInitials: string;
  actorRole?: string;
  icon: string;
}>;

export type IncidentDetailTimelineCardProps = Readonly<{
  events?: readonly TimelineEvent[];
  className?: string;
}>;

const DEFAULT_EVENTS: readonly TimelineEvent[] = [
  {
    id: "ev1",
    title: "Incident reported via mobile",
    description:
      "Hydraulic press hose ruptured at coupling on Line 2 — Press #4. Submitted with 2 photos.",
    time: "Apr 24 · 09:12",
    actorName: "Maria Lopez",
    actorInitials: "ML",
    actorRole: "Operator",
    icon: "mdi:alert-outline",
  },
  {
    id: "ev2",
    title: "Photos attached",
    description: "IMG_2207.jpg, IMG_2208.jpg added to the report.",
    time: "Apr 24 · 09:14",
    actorName: "Maria Lopez",
    actorInitials: "ML",
    actorRole: "Operator",
    icon: "mdi:image-outline",
  },
  {
    id: "ev3",
    title: "Auto-routed to EHS",
    description:
      "Severity classified Lost Time → assigned to Sarah Mitchell (EHS Manager, Plant A).",
    time: "Apr 24 · 09:18",
    actorName: "System",
    actorInitials: "SYS",
    actorRole: "Auto-routing",
    icon: "mdi:shuffle-variant",
  },
  {
    id: "ev4",
    title: "Acknowledged · investigation opened",
    description: "Status moved to Investigating. Watchers notified.",
    time: "Apr 24 · 09:34",
    actorName: "Sarah Mitchell",
    actorInitials: "SM",
    actorRole: "EHS Manager",
    icon: "mdi:check-circle-outline",
  },
  {
    id: "ev5",
    title: "Equipment locked out (LOTO)",
    description:
      "Press #4 isolated under lockout/tagout. Tag #LT-4471 applied.",
    time: "Apr 24 · 09:42",
    actorName: "Mike Reyes",
    actorInitials: "MR",
    actorRole: "Maintenance",
    icon: "mdi:lock-outline",
  },
  {
    id: "ev6",
    title: "Replacement hose ordered",
    description: "Part #HD-800-2 ordered. ETA 2 hours. Press remains isolated.",
    time: "Apr 24 · 10:02",
    actorName: "Maintenance",
    actorInitials: "MNT",
    actorRole: "Team",
    icon: "mdi:wrench-outline",
  },
  {
    id: "ev7",
    title: "Witness statement filed",
    description:
      "Corroborated the sequence of events; no operator contact with fluid.",
    time: "Apr 24 · 11:30",
    actorName: "Jake Bell",
    actorInitials: "JB",
    actorRole: "Witness",
    icon: "mdi:account-voice",
  },
  {
    id: "ev8",
    title: "CAPA-512 created",
    description:
      "Root-cause analysis initiated; preventive replacement schedule under review.",
    time: "Apr 24 · 14:20",
    actorName: "Sarah Mitchell",
    actorInitials: "SM",
    actorRole: "EHS Manager",
    icon: "mdi:plus-circle-outline",
  },
];

export function IncidentDetailTimelineCard(
  props: Readonly<IncidentDetailTimelineCardProps>,
) {
  const { events = DEFAULT_EVENTS, className = "" } = props;

  const handleExport = () => {
    toast.success("Timeline Exported", "Activity logs exported successfully.");
  };

  return (
    <IncidentGlassCard paddingClassName="p-4 sm:p-5" className={className}>
      {/* Header section with export button */}
      <div className="mb-4 flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-4">
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
            Activity timeline
          </Text>
          <span className="text-ehs-muted-text text-[11px]">
            {events.length} events · most recent last
          </span>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="text-ehs-gray flex items-center gap-1.5 rounded-[6px] border border-[rgba(15,23,42,0.08)] bg-white/70 px-2.5 py-1 text-[11px] font-bold transition-colors hover:bg-white"
        >
          <Icon icon="mdi:export" className="size-3.5" />
          <span>Export log</span>
        </button>
      </div>

      {/* Activity list connected by vertical line */}
      <div className="flex flex-col">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className="text-ehs-gray z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.06)] bg-[rgba(15,23,42,0.03)]">
                <Icon icon={event.icon} className="size-3.5" />
              </div>
              {index < events.length - 1 && (
                <div className="my-1 min-h-[44px] w-px flex-1 bg-[rgba(15,23,42,0.08)]" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5 pb-6 last:pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-ehs-dark-bg text-[12.5px] leading-tight font-bold">
                  {event.title}
                </span>
                <span className="text-ehs-muted-text shrink-0 text-[10px] leading-tight">
                  {event.time}
                </span>
              </div>
              <p className="text-ehs-gray mt-1 text-[11.5px] leading-relaxed">
                {event.description}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-md bg-[#0891a6]/10 text-[9px] font-bold text-[#056e7e]">
                  {event.actorInitials}
                </span>
                <span className="text-ehs-dark-bg text-[10.5px] font-semibold">
                  {event.actorName}
                </span>
                {event.actorRole && (
                  <span className="text-ehs-muted-text text-[10.5px]">
                    · {event.actorRole}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
