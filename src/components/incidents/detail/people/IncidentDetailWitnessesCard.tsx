"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { WitnessRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

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

const fieldInputClass = FIELD_INPUT_CLASS;

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
      paddingClassName="p-4.75"
      className={[className, isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between pb-3.5">
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text3">
            Witnesses
          </Text>
          <span className="text-ehs-muted-text text4 leading-normal">
            {witnesses.length} logged
          </span>
        </div>
        {showAdd ? (
          <button
            type="button"
            onClick={onAddWitness}
            className="text-ehs-dark-bg inline-flex items-center gap-2 rounded-2.5 border border-white/90 bg-[rgba(255,255,255,0.62)] px-2.75 py-[6.5px] text5 shadow-sm backdrop-blur-1.5 transition-colors hover:bg-white/80"
          >
            <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
            Add
          </button>
        ) : null}
      </div>

      {witnesses.length === 0 ? (
        <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] py-6 text-center text4">
          {isEditing
            ? "No witnesses yet. Click Add to include one."
            : "No witnesses logged."}
        </div>
      ) : (
        witnesses.map((witness, index) => (
          <div
            key={`${witness.name}-${String(index)}`}
            className="flex items-center gap-2.5 border-t border-[rgba(15,23,42,0.08)] pt-2.75 pb-2.5"
          >
            <div className="text-ehs-gray flex size-7.5 shrink-0 items-center justify-center rounded-2.25 bg-[rgba(255,255,255,0.82)] text7">
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
                    className={`${fieldInputClass} text4`}
                    aria-label="Witness role"
                  />
                </>
              ) : (
                <>
                  <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                    {witness.name}
                  </span>
                  <span className="text-ehs-muted-text truncate text4 leading-normal">
                    {witness.role}
                  </span>
                </>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => onRemoveWitness?.(index)}
                className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-7 shrink-0 items-center justify-center rounded-2 transition-colors hover:bg-[rgba(11,19,32,0.08)]"
                aria-label={`Remove witness ${witness.name || String(index + 1)}`}
              >
                <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span
                className={[
                  "text-ehs-gray inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-0.75 text7 leading-3.5",
                  witness.badgeTone === "green"
                    ? "bg-ehs-dark-bg/14"
                    : "bg-ehs-dark-bg/16",
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
