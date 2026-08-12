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
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.5"
      className={className}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text3">
            Activity timeline
          </Text>
          <span className="text-ehs-muted-text text4 leading-normal">
            {events.length} events · most recent last
          </span>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="text-ehs-dark-bg inline-flex shrink-0 items-center gap-2 rounded-2.5 border border-white/90 bg-[rgba(255,255,255,0.62)] px-3.75 pt-2.5 pb-[10.5px] text5 backdrop-blur-1.5 transition-colors hover:bg-white/80"
        >
          <Icon
            icon="mdi:export-variant"
            className="size-3.25"
            aria-hidden="true"
          />
          Export log
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-ehs-muted-text py-10 text-center text4">
          No activity recorded for this incident yet.
        </div>
      ) : (
        <div className="relative pl-1">
          <div
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 left-5.25 w-0.5 bg-[rgba(15,23,42,0.04)]"
          />
          <div className="relative flex flex-col gap-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3.5 py-2">
                <div className="border-ehs-form-classes-bg bg-ehs-dark-bg/14 text-ehs-gray relative z-1 flex size-9 shrink-0 items-center justify-center rounded-2.75 border-2">
                  <Icon
                    icon={event.icon}
                    className="size-4"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.75 pb-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                      {event.title}
                    </span>
                    <span className="text-ehs-muted-text ml-auto text4 leading-normal whitespace-nowrap">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-ehs-gray text4 leading-4.5">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.75">
                    <span className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue flex size-5 shrink-0 items-center justify-center rounded-md text7">
                      {event.actorInitials}
                    </span>
                    <span className="text-ehs-gray text4 leading-normal">
                      {event.actorName}
                    </span>
                    {event.actorRole ? (
                      <span className="text-ehs-muted-text text4 leading-normal">
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
