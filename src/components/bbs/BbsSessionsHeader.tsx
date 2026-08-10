"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

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
