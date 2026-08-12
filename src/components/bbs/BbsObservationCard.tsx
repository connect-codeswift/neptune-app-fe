"use client";

import { Icon } from "@iconify/react";
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
  onClick?: () => void;
}>;

/** Mobile observation card — mirrors Walk & Talk session cards / Figma BBS mobile. */
export function BbsObservationCard(props: BbsObservationCardProps) {
  const { session, onClick } = props;
  const safeLabel = `${String(session.safePercent)}% Safe`;
  const safeTone = session.safePercent >= 80 ? "teal" : "warn";

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-3 rounded-xl border bg-white p-3.5 text-left shadow-[0px_4px_6px_rgba(15,23,42,0.05)] transition-colors hover:bg-slate-50/80"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-ehs-muted-text text-2.75 font-bold">
          {session.id}
        </span>
        <IncidentBadge
          label={safeLabel}
          tone={safeTone}
          className="w-fit rounded-md px-2 py-1 text-2.75!"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ehs-dark-bg text-sm font-bold">
          {session.behaviors}
        </span>
        <span className="text-ehs-muted-text text-xs font-medium">
          {`${session.observer} · ${session.location}`}
        </span>
      </div>

      <div className="border-ehs-border border-t" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-ehs-muted-text flex min-w-0 items-center gap-1 text-2.75 font-medium">
          <Icon
            icon="mdi:account-outline"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{session.observer}</span>
        </span>
        <IncidentBadge
          label={session.type}
          tone={observeTone(session.type)}
          className="w-fit rounded-md px-2 py-0.5 text-2.75!"
        />
      </div>
    </button>
  );
}
