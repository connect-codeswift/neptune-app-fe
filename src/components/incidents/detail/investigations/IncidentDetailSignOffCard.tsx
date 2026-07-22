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
        className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
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
                  ? "bg-[rgba(8,145,166,0.18)] text-[#056e7e]"
                  : "bg-[rgba(255,255,255,0.82)] text-[#566072]",
              ].join(" ")}
            >
              {person.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[12px] leading-normal font-bold text-[#0b1320]">
                {person.name}
              </span>
              <span className="truncate text-[11px] leading-normal text-[#8892a3]">
                {person.role.replace(/\s*-\s*/g, " · ")}
              </span>
            </div>
            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.2px] text-[#566072]",
                person.badgeTone === "green"
                  ? "bg-[rgba(11,19,32,0.14)]"
                  : "bg-[rgba(11,19,32,0.16)]",
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
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0891a6] px-[15px] py-2.5 text-[13px] font-bold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition-colors hover:bg-[#067a8c]"
      >
        <Icon icon="mdi:check" className="size-3.5" aria-hidden="true" />
        Request approval
      </button>
    </IncidentGlassCard>
  );
}
