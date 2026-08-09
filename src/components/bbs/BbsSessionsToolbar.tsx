"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

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
            className={`${FIELD_INPUT_LG_CLASS} pl-9`}
          />
        </div>

        <GlassSelect
          // "" is the real "All" choice here (not a placeholder), so it stays
          // a selectable option and still routes through onChange.
          options={[{ value: "", label: "All" }, ...categoryOptions]}
          value={categoryId}
          onChange={(value) => onCategoryChange?.(value)}
          aria-label="Behavior category"
          disabled={categoriesLoading}
          className="shrink-0"
          triggerClassName={`${FIELD_INPUT_LG_CLASS} min-w-0 font-medium sm:min-w-44`}
        />
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
