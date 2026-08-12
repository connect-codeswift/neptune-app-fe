"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type WalkTalkSessionsHeaderProps = Readonly<{
  sessionCount?: number;
  onStartWalkTalk?: () => void;
}>;

/** Card header for the sessions table: title + count + primary action. */
export function WalkTalkSessionsHeader(props: WalkTalkSessionsHeaderProps) {
  const { sessionCount, onStartWalkTalk } = props;

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
        <span className="hidden sm:inline">Log Walk & Talk</span>
      </Button>
    </div>
  );
}
