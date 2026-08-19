"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { WalkTalkSession } from "@/app/dashboard/walk-talk/walk-talk-data";
import { formatRecordDisplayId } from "@/lib/format-record-id";

export type WalkTalkSessionCardProps = Readonly<{
  session: WalkTalkSession;
  isSelected?: boolean;
  /** Toggle the side details panel (same as the desktop eye column). */
  onViewMore?: () => void;
}>;

/** Mobile session card — matches Figma 6415:34651. */
export function WalkTalkSessionCard(props: WalkTalkSessionCardProps) {
  const { session, isSelected = false, onViewMore } = props;
  const displayId = formatRecordDisplayId("WT", session.id);

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
          {displayId}
        </Text>
        <div className="flex items-center gap-1.5">
          <IncidentBadge
            label={session.type}
            tone="muted"
            className="text8 w-fit rounded-md px-2 py-1 tracking-normal"
          />
          {onViewMore ? (
            <button
              type="button"
              className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={
                isSelected
                  ? `Close details for ${displayId}`
                  : `View ${displayId}`
              }
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
          {session.focusArea}
        </Text>
        <Text as="span" className="text8 text-ehs-muted-text">
          {`${session.observer} · ${session.site}`}
        </Text>
      </div>

      <div className="border-ehs-border border-t" />

      <div className="flex items-center justify-between gap-3">
        <span className="text8 text-ehs-muted-text flex min-w-0 items-center gap-1">
          <Icon
            icon="mdi:account-outline"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{session.observer}</span>
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
