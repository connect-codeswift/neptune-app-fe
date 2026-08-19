"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";

function observeTone(type: string): "teal" | "warn" | "muted" {
  const normalized = type.trim().toLowerCase();
  if (normalized === "safe") return "teal";
  if (normalized === "at-risk" || normalized === "at risk") return "warn";
  return "muted";
}

export type BbsObservationCardProps = Readonly<{
  session: BbsSession;
  isSelected?: boolean;
  /** Toggle the side details panel (same as the desktop eye column). */
  onViewMore?: () => void;
}>;

/** Mobile observation card — matches Walk & Talk session cards. */
export function BbsObservationCard(props: BbsObservationCardProps) {
  const { session, isSelected = false, onViewMore } = props;

  return (
    <div
      className={[
        "border-ehs-border bg-ehs-surface flex w-full flex-col gap-3 rounded-xl border p-3.5 shadow-[0px_4px_6px_rgba(15,23,42,0.05)]",
        isSelected ? "ring-ehs-normal-blue/30 ring-2" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="span" className="text7 text-ehs-muted-text">
          {session.id}
        </Text>
        <div className="flex items-center gap-1.5">
          <IncidentBadge
            label={session.type}
            tone={observeTone(session.type)}
            showDot
            className="text8 w-fit rounded-md px-2 py-1 tracking-normal"
          />
          {onViewMore ? (
            <button
              type="button"
              className={[
                "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors",
                isSelected
                  ? "bg-ehs-normal-blue/12 text-ehs-normal-blue"
                  : "text-ehs-muted-text hover:text-ehs-dark-bg",
              ].join(" ")}
              aria-label={
                isSelected
                  ? `Close details for ${session.id}`
                  : `View ${session.id}`
              }
              aria-pressed={isSelected}
              onClick={onViewMore}
            >
              <Icon
                icon={
                  isSelected
                    ? "icon-park-outline:preview-close-one"
                    : "lets-icons:view"
                }
                className="size-5"
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="span" className="text4 text-ehs-darker">
          {session.behaviors}
        </Text>
        <Text as="span" className="text8 text-ehs-muted-text">
          {`${session.observer} · ${session.location}`}
        </Text>
      </div>

      <div className="border-ehs-border border-t" />

      <div className="flex items-center justify-between gap-3">
        <span className="text8 text-ehs-muted-text flex min-w-0 items-center gap-1">
          <Icon
            icon="mdi:map-marker-outline"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{session.location}</span>
        </span>
        <span className="text8 text-ehs-muted-text flex shrink-0 items-center gap-1">
          <Icon
            icon="mdi:calendar-outline"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
          {session.when}
        </span>
      </div>
    </div>
  );
}
