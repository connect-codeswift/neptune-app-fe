"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type ReportingRegisterHeaderProps = Readonly<{
  count?: number;
  itemNoun: string;
  itemNounPlural: string;
  actionLabel: string;
  onAction: () => void;
}>;

/** Card header for Hazard / Near Miss register: title + count + report action. */
export function ReportingRegisterHeader(
  props: Readonly<ReportingRegisterHeaderProps>,
) {
  const { count, itemNoun, itemNounPlural, actionLabel, onAction } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          Register
        </Text>
        {count != null ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${String(count)} ${count === 1 ? itemNoun : itemNounPlural}`}
          </Text>
        ) : null}
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onAction}
        className={TABLE_HEADER_ACTION_CLASS}
      >
        <Icon
          icon="mdi:plus"
          className={TABLE_HEADER_ACTION_ICON_CLASS}
          aria-hidden="true"
        />
        {actionLabel}
      </Button>
    </div>
  );
}
