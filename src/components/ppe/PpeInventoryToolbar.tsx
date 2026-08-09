"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

export type PpeCategoryFilter = "all" | string;

export type PpeCategoryOption = Readonly<{
  id: PpeCategoryFilter;
  label: string;
}>;

export type PpeSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  /** Right-aligned count, e.g. "7 items". */
  resultLabel: string;
}>;

/** Search field above the inventory card. */
export function PpeSearchBar(props: PpeSearchBarProps) {
  const { value, onChange, resultLabel } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full min-w-0 sm:max-w-96 sm:flex-1">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Search by category, supplier..."
          aria-label="Search PPE inventory"
          className={`${FIELD_INPUT_LG_CLASS} pl-9`}
        />
      </div>

      <span className="text-ehs-muted-text hidden shrink-0 text-sm md:inline">
        {resultLabel}
      </span>
    </div>
  );
}

export type PpeInventoryHeaderProps = Readonly<{
  category: PpeCategoryFilter;
  categories: readonly PpeCategoryOption[];
  onCategoryChange: (category: PpeCategoryFilter) => void;
  onIssuePpe?: () => void;
}>;

/** Card header for inventory — pills on mobile, dropdown on desktop. */
export function PpeInventoryHeader(props: Readonly<PpeInventoryHeaderProps>) {
  const { category, categories, onCategoryChange, onIssuePpe } = props;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text
          as="h3"
          className="text-ehs-darker shrink-0 text-lg font-extrabold md:text-xl md:font-bold"
        >
          Inventory
        </Text>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
          <div className="relative hidden shrink-0 md:block">
            <select
              value={category}
              aria-label="Category filter"
              onChange={(event) => {
                onCategoryChange(event.target.value);
              }}
              className={`${FIELD_INPUT_LG_CLASS} min-w-0 cursor-pointer appearance-none pr-9 font-medium sm:min-w-44`}
            >
              {categories.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
            <Icon
              icon="mdi:chevron-down"
              className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={onIssuePpe}
            className="shrink-0 gap-1 rounded-lg px-3 py-1.5 md:gap-2 md:rounded-[10px] md:px-3.5 md:py-2"
          >
            <Icon
              icon="mdi:plus"
              className="size-3 shrink-0 md:size-3.5"
              aria-hidden="true"
            />
            <span className="text-xs font-bold whitespace-nowrap md:text-base">
              Issue PPE
            </span>
          </Button>
        </div>
      </div>

      <div
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 md:hidden"
        role="tablist"
        aria-label="Category filter"
      >
        {categories.map((filter) => {
          const isActive = category === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                onCategoryChange(filter.id);
              }}
              className={[
                "shrink-0 cursor-pointer rounded-[20px] px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors",
                isActive
                  ? "bg-ehs-normal-blue font-bold text-white"
                  : "border-ehs-border text-ehs-muted-text border bg-white font-medium",
              ].join(" ")}
            >
              {filter.id === "all" ? "All" : filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
