"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type CapaRegisterHeaderProps = Readonly<{
  capaCount?: number;
  onNewCapa?: () => void;
}>;

/** Card header for the CAPA register table: title + count + primary action. */
export function CapaRegisterHeader(props: CapaRegisterHeaderProps) {
  const { capaCount, onNewCapa } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          Register
        </Text>
        {capaCount != null ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${String(capaCount)} ${capaCount === 1 ? "CAPA" : "CAPAs"}`}
          </Text>
        ) : null}
      </div>

      {onNewCapa ? (
        <Button
          type="button"
          variant="primary"
          onClick={onNewCapa}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon="mdi:plus"
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New CAPA</span>
        </Button>
      ) : null}
    </div>
  );
}
