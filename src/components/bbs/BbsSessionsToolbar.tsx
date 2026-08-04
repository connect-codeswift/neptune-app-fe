"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

export type BbsCategoryOption = Readonly<{
  value: string;
  label: string;
}>;

export type BbsSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  /** Right-aligned count, e.g. "6 sessions". */
  resultLabel: string;
  /** Selected behavior category id, or "" for All. */
  categoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  categoryOptions?: readonly BbsCategoryOption[];
  categoriesLoading?: boolean;
}>;

/** Search field above the sessions card, with category filter + result count. */
export function BbsSearchBar(props: BbsSearchBarProps) {
  const {
    value,
    onChange,
    resultLabel,
    categoryId = "",
    onCategoryChange,
    categoryOptions = [],
    categoriesLoading = false,
  } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full min-w-0 sm:w-96">
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
            placeholder="Search by ID, observer, location..."
            aria-label="Search sessions"
            className="border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-xl border bg-white py-2.5 pr-3 pl-9 shadow-sm transition outline-none focus:ring-2"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={categoryId}
            aria-label="Behavior category"
            disabled={categoriesLoading}
            onChange={(event) => {
              onCategoryChange?.(event.target.value);
            }}
            className="border-ehs-border text-ehs-dark-bg focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full min-w-0 cursor-pointer appearance-none rounded-xl border bg-white py-2.5 pr-9 pl-3.5 font-medium transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-44"
          >
            <option value="">All</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>
      </div>

      <span className="text-ehs-muted-text shrink-0">{resultLabel}</span>
    </div>
  );
}

export type BbsSessionsHeaderProps = Readonly<{
  onLogObservation?: () => void;
}>;

/** Card header for the sessions table: title + the primary action. */
export function BbsSessionsHeader(props: BbsSessionsHeaderProps) {
  const { onLogObservation } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-ehs-dark-bg shrink-0 font-bold">Recent sessions</h3>

      <Button
        type="button"
        variant="primary"
        onClick={onLogObservation}
        className="shrink-0 gap-2 rounded-[10px] px-3 py-2 sm:px-4 sm:py-2.5"
      >
        <Icon icon="mdi:plus" className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold whitespace-nowrap sm:hidden">
          Log
        </span>
        <span className="hidden text-sm font-semibold whitespace-nowrap sm:inline">
          Log Observation
        </span>
      </Button>
    </div>
  );
}
