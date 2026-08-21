"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type BbsSessionsHeaderProps = Readonly<{
  sessionCount?: number;
  onLogObservation?: () => void;
}>;

/** Card header for the sessions table: title + count + primary action. */
export function BbsSessionsHeader(props: BbsSessionsHeaderProps) {
  const { sessionCount, onLogObservation } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          Recent sessions
        </Text>
        {sessionCount != null ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${String(sessionCount)} ${sessionCount === 1 ? "session" : "sessions"}`}
          </Text>
        ) : null}
      </div>

      {/* Hidden without Bbs.Create. The API refuses the call regardless, so
          rendering the button only offers a dead end. */}
      <Can do="Bbs.Create">
        <Button
          type="button"
          variant="primary"
          onClick={onLogObservation}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon="mdi:plus"
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          <span className="sm:hidden">Log</span>
          <span className="hidden sm:inline">Log Observation</span>
        </Button>
      </Can>
    </div>
  );
}
