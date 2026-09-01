"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { CheckboxInput } from "@/components/inputs/CheckboxInput";
import { Text } from "@/components/Text";
import type { IncidentDetailResponseAction } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { IncidentDetailResponseAction };

export type IncidentDetailResponseCardProps = Readonly<{
  actions?: readonly IncidentDetailResponseAction[];
  /**
   * Turns the tiles into toggles. Every action is shown while editing, ticked
   * or not — an unticked one has to be reachable to be ticked, and the empty
   * state would otherwise hide all six on an incident where nothing was logged.
   */
  isEditing?: boolean;
  onToggleAction?: (id: string) => void;
  className?: string;
}>;

export function IncidentDetailResponseCard(
  props: Readonly<IncidentDetailResponseCardProps>,
) {
  // No placeholder actions. These are safety claims on an incident record —
  // "Equipment locked out (LOTO)", "Spill contained" — and the previous
  // fallback asserted them even when the API returned an explicitly empty
  // list, turning "nothing was done" into "these things were done".
  const {
    actions = [],
    isEditing = false,
    onToggleAction,
    className = "",
  } = props;
  const isInteractive = isEditing && onToggleAction !== undefined;

  /*
   * Read-only, this card is a record of what was done on scene — not a
   * checklist of what could have been.
   *
   * The mapper deliberately returns all six options with a `completed` flag,
   * because editing needs the unticked ones to be reachable and the header
   * stat counts against the full set. Rendering that list as-is here put five
   * unticked tiles next to the one action that actually happened, which reads
   * as five things still outstanding rather than five things that were never
   * part of this incident.
   *
   * It also made the empty state unreachable: `actions` was always six long,
   * so an incident where nothing was logged showed six blank tiles instead of
   * saying so.
   */
  const visibleActions = isInteractive
    ? actions
    : actions.filter((action) => action.completed);

  return (
    <IncidentGlassCard
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.5"
      // Same edit ring as the Summary and Info cards above it. Without it this
      // was the one card on the tab that turned editable without looking it.
      className={[className, isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-0.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Immediate response
        </Text>
        <span className="text-ehs-muted-text text4 leading-normal">
          Actions taken on-scene
        </span>
      </div>

      {visibleActions.length === 0 && !isInteractive ? (
        <EmptyState
          variant="plain"
          icon="mdi:medical-bag"
          title="No on-scene actions"
          message="Immediate actions taken at the scene appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleActions.map((action) => (
            <CheckboxInput
              key={action.id}
              variant="tile"
              tone="green"
              size="sm"
              label={action.label}
              checked={action.completed}
              // No handler while the card is read-only: the tile then renders
              // as the record it is, rather than as a control that ignores you.
              onChange={
                isInteractive ? () => onToggleAction(action.id) : undefined
              }
              className="h-9.5 min-h-0 rounded-lg px-3.25 py-2.75"
            />
          ))}
        </div>
      )}
    </IncidentGlassCard>
  );
}
