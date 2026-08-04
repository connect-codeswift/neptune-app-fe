"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { SignOffRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type { SignOffRow };

export type IncidentDetailSignOffCardProps = Readonly<{
  signoffs?: readonly SignOffRow[];
  onRequestApproval?: () => void;
  className?: string;
}>;

const DEFAULT_SIGNOFFS: readonly SignOffRow[] = [
  {
    name: "Sarah Mitchell",
    role: "EHS Manager · Investigator",
    initials: "SM",
    badgeLabel: "Signed",
    badgeTone: "green",
  },
  {
    name: "Tom Park",
    role: "Plant Manager · Approver",
    initials: "TP",
    badgeLabel: "Awaiting",
    badgeTone: "gray",
  },
];

export function IncidentDetailSignOffCard(
  props: Readonly<IncidentDetailSignOffCardProps>,
) {
  const {
    signoffs = DEFAULT_SIGNOFFS,
    onRequestApproval,
    className = "",
  } = props;

  const handleRequest =
    onRequestApproval ??
    (() => {
      toast.success(
        "Approval Requested",
        "EHS sign-off notifications dispatched to reviewers.",
      );
    });

  return (
    <IncidentGlassCard
      paddingClassName="p-[18px]"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg text-lg font-semibold"
      >
        Sign-off
      </Text>

      <div className="mt-[18px] flex flex-col">
        {signoffs.map((person, index) => (
          <div
            key={`${person.name}-${String(index)}`}
            className={[
              "flex items-center gap-2.5",
              index === 0
                ? "pb-3"
                : "border-t border-[rgba(15,23,42,0.08)] pt-[13px] pb-1",
            ].join(" ")}
          >
            <div
              className={[
                "flex size-8 shrink-0 items-center justify-center rounded-[9.6px] text-[10.9px] font-bold",
                index === 0
                  ? "bg-ehs-dark-blue-bg-light text-ehs-dark-blue"
                  : "bg-[rgba(255,255,255,0.82)] text-ehs-gray",
              ].join(" ")}
            >
              {person.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm leading-normal font-bold text-ehs-dark-bg">
                {person.name}
              </span>
              <span className="truncate text-sm leading-normal text-ehs-muted-text">
                {person.role.replace(/\s*-\s*/g, " · ")}
              </span>
            </div>
            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] py-[3px] text-xs leading-[14px] font-bold tracking-[0.2px] text-ehs-gray",
                person.badgeTone === "green"
                  ? "bg-ehs-dark-bg/14"
                  : "bg-ehs-dark-bg/16",
              ].join(" ")}
            >
              {person.badgeTone === "green" ? (
                <Icon icon="mdi:check" className="size-2.5" aria-hidden="true" />
              ) : null}
              {person.badgeLabel}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleRequest}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-ehs-normal-blue px-[15px] py-2.5 text-sm font-bold text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors hover:bg-ehs-normal-blue-active"
      >
        <Icon icon="mdi:check" className="size-3.5" aria-hidden="true" />
        Request approval
      </button>
    </IncidentGlassCard>
  );
}
