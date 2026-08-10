"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type WalkTalkSessionsHeaderProps = Readonly<{
  onStartWalkTalk?: () => void;
}>;

/** Card header for the sessions table: title + the primary action. */
export function WalkTalkSessionsHeader(props: WalkTalkSessionsHeaderProps) {
  const { onStartWalkTalk } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-ehs-dark-bg shrink-0 font-bold">Recent sessions</h3>

      <Button
        type="button"
        variant="primary"
        onClick={onStartWalkTalk}
        className={TABLE_HEADER_ACTION_CLASS}
      >
        <Icon
          icon="mdi:plus"
          className={TABLE_HEADER_ACTION_ICON_CLASS}
          aria-hidden="true"
        />
        <span className="sm:hidden">Log Session</span>
        <span className="hidden sm:inline">Log Walk-and-Talk</span>
      </Button>
    </div>
  );
}
