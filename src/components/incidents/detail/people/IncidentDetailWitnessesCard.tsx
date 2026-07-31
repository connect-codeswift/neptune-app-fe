"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { WitnessRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { WitnessRow };

export type IncidentDetailWitnessesCardProps = Readonly<{
  witnesses?: readonly WitnessRow[];
  onAddWitness?: () => void;
  onChangeWitness?: (
    index: number,
    patch: Partial<Pick<WitnessRow, "name" | "role">>,
  ) => void;
  onRemoveWitness?: (index: number) => void;
  isEditing?: boolean;
  readOnly?: boolean;
  className?: string;
}>;

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white px-2.5 py-1.5 text-[12px] text-[#0b1320] outline-none transition focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20";

export function IncidentDetailWitnessesCard(
  props: Readonly<IncidentDetailWitnessesCardProps>,
) {
  const {
    witnesses = [],
    onAddWitness,
    onChangeWitness,
    onRemoveWitness,
    isEditing = false,
    readOnly = false,
    className = "",
  } = props;

  const showAdd = isEditing && !readOnly && Boolean(onAddWitness);

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      className={[className, isEditing ? "ring-1 ring-[#0891a6]/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between pb-[14px]">
        <div className="flex flex-col gap-0.5">
          <Text
            as="h3"
            className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
          >
            Witnesses
          </Text>
          <span className="text-[11px] leading-normal text-[#8892a3]">
            {witnesses.length} logged
          </span>
        </div>
        {showAdd ? (
          <button
            type="button"
            onClick={onAddWitness}
            className="inline-flex items-center gap-2 rounded-[10px] border border-white/90 bg-[rgba(255,255,255,0.62)] px-[11px] py-[6.5px] text-[11px] font-bold text-[#0b1320] shadow-sm backdrop-blur-[6px] transition-colors hover:bg-white/80"
          >
            <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
            Add
          </button>
        ) : null}
      </div>

      {witnesses.length === 0 ? (
        <div className="border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-[12px] text-[#8892a3]">
          {isEditing
            ? "No witnesses yet. Click Add to include one."
            : "No witnesses logged."}
        </div>
      ) : (
        witnesses.map((witness, index) => (
          <div
            key={`${witness.name}-${String(index)}`}
            className="flex items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[11px] pb-[10px]"
          >
            <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[rgba(255,255,255,0.82)] text-[10.2px] font-bold text-[#566072]">
              {witness.initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={witness.name}
                    onChange={(event) =>
                      onChangeWitness?.(index, { name: event.target.value })
                    }
                    placeholder="Witness name"
                    className={fieldInputClass}
                    aria-label="Witness name"
                  />
                  <input
                    type="text"
                    value={witness.role}
                    onChange={(event) =>
                      onChangeWitness?.(index, { role: event.target.value })
                    }
                    placeholder="Role"
                    className={`${fieldInputClass} text-[11px]`}
                    aria-label="Witness role"
                  />
                </>
              ) : (
                <>
                  <span className="text-[12px] leading-normal font-bold text-[#0b1320]">
                    {witness.name}
                  </span>
                  <span className="truncate text-[11px] leading-normal text-[#8892a3]">
                    {witness.role}
                  </span>
                </>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => onRemoveWitness?.(index)}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] text-[#8892a3] transition-colors hover:bg-[rgba(11,19,32,0.08)] hover:text-[#0b1320]"
                aria-label={`Remove witness ${witness.name || String(index + 1)}`}
              >
                <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.2px] text-[#566072]",
                  witness.badgeTone === "green"
                    ? "bg-[rgba(11,19,32,0.14)]"
                    : "bg-[rgba(11,19,32,0.16)]",
                ].join(" ")}
              >
                {witness.badgeTone === "green" ? (
                  <Icon
                    icon="mdi:check"
                    className="size-2.5"
                    aria-hidden="true"
                  />
                ) : null}
                {witness.badgeLabel}
              </span>
            )}
          </div>
        ))
      )}
    </IncidentGlassCard>
  );
}
