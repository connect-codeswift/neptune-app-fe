"use client";

import { Icon } from "@iconify/react";
import {
  LOTO_STATUS_FILTERS,
  type LotoStatusFilter,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

export type LotoEquipmentToolbarProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  status: LotoStatusFilter;
  onStatusChange: (status: LotoStatusFilter) => void;
  resultLabel: string;
}>;

/** Search + status pills above the equipment table. */
export function LotoEquipmentToolbar(
  props: Readonly<LotoEquipmentToolbarProps>,
) {
  const { query, onQueryChange, status, onStatusChange, resultLabel } = props;

  return (
    <div className="border-ehs-border flex flex-wrap items-center gap-3 rounded-[20px] border bg-white/62 px-3.5 py-2.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]">
      <div className="relative min-w-0 flex-1 sm:max-w-70">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          placeholder="Search equipment…"
          aria-label="Search equipment"
          className={`${FIELD_INPUT_LG_CLASS} pl-9`}
        />
      </div>

      <div
        className="flex flex-wrap items-center gap-3"
        role="tablist"
        aria-label="Equipment status filter"
      >
        {LOTO_STATUS_FILTERS.map((filter) => {
          const isActive = status === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                onStatusChange(filter.id);
              }}
              className={[
                "cursor-pointer rounded-lg px-3 py-1.25 text-base whitespace-nowrap transition-colors",
                isActive
                  ? "bg-ehs-darker font-semibold text-white"
                  : "bg-[rgba(15,23,42,0.06)] font-normal text-[#566072] hover:bg-[rgba(15,23,42,0.1)]",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <span className="ml-auto shrink-0 text-base text-[#8892a3]">
        {resultLabel}
      </span>
    </div>
  );
}
