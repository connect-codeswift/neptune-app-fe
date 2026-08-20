"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentDetailResponseAction } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { IncidentDetailResponseAction };

export type IncidentDetailResponseCardProps = Readonly<{
  actions?: readonly IncidentDetailResponseAction[];
  className?: string;
}>;

export function IncidentDetailResponseCard(
  props: Readonly<IncidentDetailResponseCardProps>,
) {
  // No placeholder actions. These are safety claims on an incident record —
  // "Equipment locked out (LOTO)", "Spill contained" — and the previous
  // fallback asserted them even when the API returned an explicitly empty
  // list, turning "nothing was done" into "these things were done".
  const { actions = [], className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.5"
      className={className}
    >
      <div className="flex flex-col gap-0.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Immediate response
        </Text>
        <span className="text-ehs-muted-text text4 leading-normal">
          Actions taken on-scene
        </span>
      </div>

      {actions.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:medical-bag"
          title="No on-scene actions"
          message="Immediate actions taken at the scene appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className={[
                "flex h-9.5 items-center gap-2.5 rounded-lg border px-3.25 py-2.75",
                action.completed
                  ? "border-ehs-green bg-ehs-green-bg-light"
                  : "border-ehs-border-ink/8 bg-ehs-surface/62",
              ].join(" ")}
            >
              {action.completed ? (
                <div className="bg-ehs-green text-ehs-on-accent flex size-4 shrink-0 items-center justify-center rounded">
                  <Icon
                    icon="mdi:check"
                    className="size-2.75"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="border-ehs-border-ink/14 size-4 shrink-0 rounded border bg-transparent" />
              )}
              <span className="text-ehs-dark-bg text4 truncate leading-normal">
                {action.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </IncidentGlassCard>
  );
}
