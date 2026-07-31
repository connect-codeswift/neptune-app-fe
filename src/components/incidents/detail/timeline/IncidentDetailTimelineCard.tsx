"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { TimelineEvent } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type { TimelineEvent };

export type IncidentDetailTimelineCardProps = Readonly<{
  events?: readonly TimelineEvent[];
  className?: string;
}>;

export function IncidentDetailTimelineCard(
  props: Readonly<IncidentDetailTimelineCardProps>,
) {
  const { events = [], className = "" } = props;

  const handleExport = () => {
    if (events.length === 0) {
      toast.info("Nothing to export", "No timeline events are available yet.");
      return;
    }

    const lines = events.map(
      (event) =>
        `${event.time}\t${event.title}\t${event.actorName}\t${event.description}`,
    );
    const content = [
      ["Time", "Title", "Actor", "Description"].join("\t"),
      ...lines,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "incident-timeline.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Timeline exported", "Activity log downloaded.");
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-[14px]"
      className={className}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text
            as="h3"
            className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
          >
            Activity timeline
          </Text>
          <span className="text-[11px] leading-normal text-[#8892a3]">
            {events.length} events · most recent last
          </span>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-white/90 bg-[rgba(255,255,255,0.62)] px-[15px] pt-[10px] pb-[10.5px] text-[13px] font-bold text-[#0b1320] backdrop-blur-[6px] transition-colors hover:bg-white/80"
        >
          <Icon icon="mdi:export-variant" className="size-[13px]" aria-hidden="true" />
          Export log
        </button>
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center text-[12px] text-[#8892a3]">
          No activity recorded for this incident yet.
        </div>
      ) : (
        <div className="relative pl-1">
          <div
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 left-[21px] w-0.5 bg-[rgba(15,23,42,0.04)]"
          />
          <div className="relative flex flex-col gap-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-[14px] py-2"
              >
                <div className="relative z-1 flex size-9 shrink-0 items-center justify-center rounded-[11px] border-2 border-[#eef1f6] bg-[rgba(11,19,32,0.14)] text-[#566072]">
                  <Icon icon={event.icon} className="size-4" aria-hidden="true" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-[3px] pb-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[13px] leading-normal font-bold text-[#0b1320]">
                      {event.title}
                    </span>
                    <span className="ml-auto text-[11px] leading-normal whitespace-nowrap text-[#8892a3]">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#566072]">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-[3px]">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[rgba(8,145,166,0.18)] text-[7px] font-bold text-[#056e7e]">
                      {event.actorInitials}
                    </span>
                    <span className="text-[11px] leading-normal text-[#566072]">
                      {event.actorName}
                    </span>
                    {event.actorRole ? (
                      <span className="text-[11px] leading-normal text-[#8892a3]">
                        · {event.actorRole}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </IncidentGlassCard>
  );
}
