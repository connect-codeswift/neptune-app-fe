"use client";
import { EmptyState } from "@/components/ui/EmptyState";

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
  /**
   * How many leading rows were already on the incident when this edit began.
   * Witnesses are owned by the incident report module, so those rows stay
   * read-only here — the People tab may only append. Rows at or past this
   * index were added during this edit and remain editable and removable.
   */
  lockedCount?: number;
  /** Indexed to match `witnesses`; `null` where the row is valid. */
  witnessErrors?: readonly (string | null)[];
  className?: string;
}>;

const fieldInputClass = FIELD_INPUT_CLASS;

function witnessBadgeClass(tone: WitnessRow["badgeTone"]): string {
  return tone === "green"
    ? "bg-ehs-surface-inverse/14"
    : "bg-ehs-surface-inverse/16";
}

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
    lockedCount = 0,
    witnessErrors = [],
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

      {isEditing && witnesses.length > 0 ? (
        <span className="text-ehs-muted-text text6 border-ehs-border-ink/8 border-t pt-2.5 leading-normal">
          Existing witnesses are locked — edit them from the incident report.
          You can still add new ones here.
        </span>
      ) : null}

      {witnesses.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:account-eye-outline"
          title="No witnesses logged"
          message={
            isEditing
              ? "Click Add to include someone who saw what happened."
              : "Witnesses recorded for this incident appear here."
          }
          className="border-ehs-border-ink/8 border-t"
        />
      ) : (
        witnesses.map((witness, index) => {
          const isLocked = index < lockedCount;
          const isRowEditable = isEditing && !isLocked;
          const rowError = witnessErrors[index] ?? null;

          return (
            <div
              // Appended rows are edited in place, so keying on `name` would
              // remount the row and drop the caret on every keystroke. The list
              // is not reordered or filtered while editing.
              key={index}
              className="border-ehs-border-ink/8 flex items-center gap-2.5 border-t pt-2.75 pb-2.5"
            >
              <div className="text-ehs-gray rounded-2.25 text7 bg-ehs-surface/82 flex size-7.5 shrink-0 items-center justify-center">
                {witness.initials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {isRowEditable ? (
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
                      aria-invalid={rowError != null}
                      required
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
                      aria-invalid={rowError != null}
                      required
                    />
                    {rowError ? (
                      <span
                        className="text-ehs-red text6 leading-normal"
                        role="alert"
                      >
                        {rowError}
                      </span>
                    ) : null}
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
              {isRowEditable ? (
                <button
                  type="button"
                  onClick={() => onRemoveWitness?.(index)}
                  className="text-ehs-muted-text hover:text-ehs-dark-bg rounded-2 hover:bg-ehs-surface-inverse/8 inline-flex size-7 shrink-0 items-center justify-center transition-colors"
                  aria-label={`Remove witness ${witness.name || String(index + 1)}`}
                >
                  <Icon
                    icon="mdi:close"
                    className="size-4"
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <span
                  className={[
                    "text-ehs-gray text7 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-0.75 leading-3.5",
                    witnessBadgeClass(witness.badgeTone),
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
          );
        })
      )}
    </IncidentGlassCard>
  );
}
