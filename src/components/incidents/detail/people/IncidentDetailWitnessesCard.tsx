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
            className="text-ehs-dark-bg rounded-2.5 text5 backdrop-blur-1.5 border-ehs-hairline/90 bg-ehs-surface/62 hover:bg-ehs-surface/80 inline-flex items-center gap-2 border px-2.75 py-[7px] shadow-sm transition-colors"
          >
            <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
            Add
          </button>
        ) : null}
      </div>

      {witnesses.length === 0 ? (
        <div className="text-ehs-muted-text text4 border-ehs-border-ink/8 border-t py-6 text-center">
          {isEditing
            ? "No witnesses yet. Click Add to include one."
            : "No witnesses logged."}
        </div>
      ) : (
        witnesses.map((witness, index) => (
          <div
            key={`${witness.name}-${String(index)}`}
            className="border-ehs-border-ink/8 flex items-center gap-2.5 border-t pt-2.75 pb-2.5"
          >
            <div className="text-ehs-gray rounded-2.25 text7 bg-ehs-surface/82 flex size-7.5 shrink-0 items-center justify-center">
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
                  <span className="text-ehs-muted-text text4 truncate leading-normal">
                    {witness.role}
                  </span>
                </>
              )}
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => onRemoveWitness?.(index)}
                className="text-ehs-muted-text hover:text-ehs-dark-bg rounded-2 hover:bg-ehs-surface-inverse/8 inline-flex size-7 shrink-0 items-center justify-center transition-colors"
                aria-label={`Remove witness ${witness.name || String(index + 1)}`}
              >
                <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span
                className={[
                  "text-ehs-gray text7 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-0.75 leading-3.5",
                  witness.badgeTone === "green"
                    ? "bg-ehs-surface-inverse/14"
                    : "bg-ehs-surface-inverse/16",
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
