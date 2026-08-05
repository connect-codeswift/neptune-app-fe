"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  HrcaContributingFactorCell,
  HrcaCorrectiveActionsCell,
  HrcaWhyCell,
} from "@/components/incidents/detail/investigations/hrca/HrcaCells";
import type { HrcaRow } from "@/components/incidents/detail/investigations/hrca/hrca-data";
import type { HrcaTableHandlers } from "@/components/incidents/detail/investigations/hrca/HrcaTable";
import { HRCA_ROW_MIN_HEIGHT_CLASS } from "@/components/incidents/detail/investigations/hrca/hrca-layout";

export type HrcaMobileLanesProps = Readonly<{
  rows: readonly HrcaRow[];
  handlers: HrcaTableHandlers;
  className?: string;
}>;

function LaneCategoryBar(
  props: Readonly<{ category: string; accent: string }>,
) {
  const { category, accent } = props;
  const lines = category.includes(" / ")
    ? category
        .split(" / ")
        .map((part, index, all) =>
          index < all.length - 1 ? `${part} /` : part,
        )
    : [category];

  return (
    <div
      className="flex items-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.08)] px-3 py-2.5"
      style={{ backgroundColor: `${accent}14` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <p className="text-ehs-dark-bg text-sm leading-[14.4px] font-bold">
        {lines.map((line) => (
          <span key={line} className="block sm:inline">
            {line}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

export function HrcaMobileLanes(props: Readonly<HrcaMobileLanesProps>) {
  const { rows, handlers, className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}
    >
      {rows.map((row) => (
        <IncidentGlassCard
          key={row.id}
          paddingClassName="p-4"
          className="bg-white/62"
        >
          <div className="flex flex-col gap-3">
            <LaneCategoryBar category={row.category} accent={row.accent} />

            <div className={HRCA_ROW_MIN_HEIGHT_CLASS}>
              <HrcaContributingFactorCell
                text={row.contributingFactor}
                accent={row.accent}
                onEdit={() =>
                  handlers.onEditFactor(row.id, row.contributingFactor)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Text
                as="p"
                className="text-ehs-muted-text text-xs font-bold tracking-[0.84px] uppercase"
              >
                Why chain
              </Text>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {[0, 1, 2, 3, 4].map((stepIdx) => {
                  const why = row.whys[stepIdx];
                  const canAdd = row.whys.length === stepIdx;
                  return (
                    <div
                      key={`${row.id}-why-${String(stepIdx)}`}
                      className="w-[min(100%,280px)] shrink-0"
                    >
                      <HrcaWhyCell
                        why={why}
                        accent={row.accent}
                        canAdd={canAdd}
                        showConnector={stepIdx > 0}
                        onEdit={() =>
                          handlers.onEditWhy(row.id, stepIdx, why?.text ?? "")
                        }
                        onRemove={() => handlers.onRemoveWhy(row.id, stepIdx)}
                        onAdd={() => handlers.onAddWhy(row.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={HRCA_ROW_MIN_HEIGHT_CLASS}>
              <HrcaCorrectiveActionsCell
                actions={row.correctiveActions}
                onAdd={() => handlers.onAddAction(row.id)}
                onEdit={(actionIndex, current) =>
                  handlers.onEditAction(row.id, actionIndex, current)
                }
                onRemove={(actionIndex) =>
                  handlers.onRemoveAction(row.id, actionIndex)
                }
              />
            </div>
          </div>
        </IncidentGlassCard>
      ))}

      <p className="text-ehs-muted-text flex items-start gap-2 px-1 text-xs leading-[17px]">
        <Icon
          icon="mdi:gesture-swipe-horizontal"
          className="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        Swipe why steps horizontally on smaller screens, or open on a wider
        display for the full worksheet grid.
      </p>
    </div>
  );
}
