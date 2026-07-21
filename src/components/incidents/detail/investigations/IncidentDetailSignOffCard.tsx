"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type SignOffRow = Readonly<{
  name: string;
  role: string;
  initials: string;
  badgeLabel: string;
  badgeTone: "green" | "gray";
}>;

export type IncidentDetailSignOffCardProps = Readonly<{
  signoffs?: readonly SignOffRow[];
  onRequestApproval?: () => void;
  className?: string;
}>;

const DEFAULT_SIGNOFFS: readonly SignOffRow[] = [
  {
    name: "Sarah Mitchell",
    role: "EHS Manager - Investigator",
    initials: "SM",
    badgeLabel: "Signed",
    badgeTone: "green",
  },
  {
    name: "Tom Park",
    role: "Plant Manager - Approver",
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

  const handleRequest = onRequestApproval ?? (() => {
    toast.success("Approval Requested", "EHS sign-off notifications dispatched to reviewers.");
  });

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[14.8px] font-bold"
      >
        Sign-off
      </Text>

      {/* Reviewer signature lists */}
      <div className="flex flex-col mb-4">
        {signoffs.map((person, index) => (
          <div
            key={person.name}
            className={[
              "flex items-center justify-between gap-3 py-3.5",
              index === signoffs.length - 1
                ? "pb-1"
                : "border-b border-[rgba(15,23,42,0.05)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-ehs-normal-blue/14 flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#056e7e]">
                {person.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-ehs-dark-bg leading-snug">
                  {person.name}
                </span>
                <span className="text-[11px] text-ehs-gray truncate leading-normal">
                  {person.role}
                </span>
              </div>
            </div>

            <span
              className={[
                "rounded-[6px] px-2.5 py-0.5 text-[9.5px] font-bold tracking-[0.2px] inline-flex items-center gap-0.5 shrink-0",
                person.badgeTone === "green"
                  ? "bg-[#10b981]/12 text-[#0f766e]"
                  : "bg-[rgba(15,23,42,0.06)] text-ehs-gray",
              ].join(" ")}
            >
              {person.badgeTone === "green" && (
                <Icon icon="mdi:check" className="size-3" />
              )}
              {person.badgeLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Request approval button */}
      <button
        type="button"
        onClick={handleRequest}
        className="w-full bg-[#0891a6] text-white rounded-[6px] text-[12px] py-2.5 font-bold flex items-center justify-center gap-1 hover:bg-[#067485] transition-colors shadow-[0px_4px_12px_-4px_#0891a6]"
      >
        <Icon icon="mdi:check" className="size-4" />
        <span>Request approval</span>
      </button>
    </IncidentGlassCard>
  );
}
