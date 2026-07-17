"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type WitnessRow = Readonly<{
  name: string;
  role: string;
  initials: string;
  badgeLabel: string;
  badgeTone: "green" | "gray";
}>;

export type IncidentDetailWitnessesCardProps = Readonly<{
  witnesses?: readonly WitnessRow[];
  onAddWitness?: () => void;
  className?: string;
}>;

const DEFAULT_WITNESSES: readonly WitnessRow[] = [
  {
    name: "Jake Bell",
    role: "Line 2 Operator",
    initials: "JB",
    badgeLabel: "Statement",
    badgeTone: "green",
  },
  {
    name: "Dana Kim",
    role: "Warehouse Lead",
    initials: "DK",
    badgeLabel: "Pending",
    badgeTone: "gray",
  },
];

export function IncidentDetailWitnessesCard(
  props: Readonly<IncidentDetailWitnessesCardProps>,
) {
  const {
    witnesses = DEFAULT_WITNESSES,
    onAddWitness,
    className = "",
  } = props;

  const handleAdd = onAddWitness ?? (() => {
    toast.info("Add Witness coming soon", "This feature is being developed.");
  });

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5 mb-2.5">
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
            Witnesses
          </Text>
          <span className="text-[11px] text-ehs-muted-text">
            {witnesses.length} logged
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-0.5 text-[11.5px] font-bold text-[#056e7e] hover:text-[#067485] transition-colors"
        >
          <Icon icon="mdi:plus" className="size-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex flex-col">
        {witnesses.map((witness, index) => (
          <div
            key={witness.name}
            className={[
              "flex items-center justify-between gap-3 py-3",
              index === witnesses.length - 1
                ? "pb-1"
                : "border-b border-[rgba(15,23,42,0.05)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-ehs-normal-blue/14 flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#056e7e]">
                {witness.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-ehs-dark-bg leading-snug">
                  {witness.name}
                </span>
                <span className="text-[11px] text-ehs-gray truncate leading-normal">
                  {witness.role}
                </span>
              </div>
            </div>

            <span
              className={[
                "rounded-[6px] px-2.5 py-0.5 text-[9.5px] font-bold tracking-[0.2px] inline-flex items-center gap-0.5 shrink-0",
                witness.badgeTone === "green"
                  ? "bg-[#10b981]/10 text-[#0f766e]"
                  : "bg-[rgba(15,23,42,0.06)] text-ehs-gray",
              ].join(" ")}
            >
              {witness.badgeTone === "green" && (
                <Icon icon="mdi:check" className="size-3" />
              )}
              {witness.badgeLabel}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
