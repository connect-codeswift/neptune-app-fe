"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

export type BbsSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  /** Right-aligned count, e.g. "6 sessions". */
  resultLabel: string;
}>;

/** Search field above the sessions card, with the result count opposite it. */
export function BbsSearchBar(props: BbsSearchBarProps) {
  const { value, onChange, resultLabel } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
        className="shrink-0 gap-2 rounded-[10px] px-4 py-2.5"
      >
        <Icon icon="mdi:plus" className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold whitespace-nowrap">
          Log Observation
        </span>
      </Button>
    </div>
  );
}
