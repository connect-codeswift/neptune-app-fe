"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type LotoRegisterHeaderProps = Readonly<{
  title?: string;
  count?: number;
  itemNoun: string;
  itemNounPlural: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
}>;

/** Card header for LOTO register tables: title + count + optional action. */
export function LotoRegisterHeader(props: Readonly<LotoRegisterHeaderProps>) {
  const {
    title = "Register",
    count,
    itemNoun,
    itemNounPlural,
    actionLabel,
    actionIcon = "mdi:plus",
    onAction,
  } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          {title}
        </Text>
        {count != null ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${String(count)} ${count === 1 ? itemNoun : itemNounPlural}`}
          </Text>
        ) : null}
      </div>

      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="primary"
          onClick={onAction}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon={actionIcon}
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
