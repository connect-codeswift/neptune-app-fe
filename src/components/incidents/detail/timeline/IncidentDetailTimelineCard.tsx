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
            className="text-ehs-dark-bg text-lg font-semibold"
          >
            Activity timeline
          </Text>
          <span className="text-sm leading-normal text-ehs-muted-text">
            {events.length} events · most recent last
          </span>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-white/90 bg-[rgba(255,255,255,0.62)] px-[15px] pt-[10px] pb-[10.5px] text-sm font-bold text-ehs-dark-bg backdrop-blur-[6px] transition-colors hover:bg-white/80"
        >
          <Icon icon="mdi:export-variant" className="size-[13px]" aria-hidden="true" />
          Export log
        </button>
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center text-sm text-ehs-muted-text">
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
                <div className="relative z-1 flex size-9 shrink-0 items-center justify-center rounded-[11px] border-2 border-ehs-form-classes-bg bg-ehs-dark-bg/14 text-ehs-gray">
                  <Icon icon={event.icon} className="size-4" aria-hidden="true" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-[3px] pb-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm leading-normal font-bold text-ehs-dark-bg">
                      {event.title}
                    </span>
                    <span className="ml-auto text-sm leading-normal whitespace-nowrap text-ehs-muted-text">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-sm leading-[18px] text-ehs-gray">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-[3px]">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-ehs-dark-blue-bg-light text-xs font-bold text-ehs-dark-blue">
                      {event.actorInitials}
                    </span>
                    <span className="text-sm leading-normal text-ehs-gray">
                      {event.actorName}
                    </span>
                    {event.actorRole ? (
                      <span className="text-sm leading-normal text-ehs-muted-text">
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
