"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";

export type InspectionsRegisterHeaderProps = Readonly<{
  onTemplates?: () => void;
  onScheduleInspection?: () => void;
}>;

/** Card header for the inspections register table: title + count + actions. */
export function InspectionsRegisterHeader(
  props: InspectionsRegisterHeaderProps,
) {
  const { onTemplates, onScheduleInspection } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          Register
        </Text>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {onTemplates ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={onTemplates}
            className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
          >
            <Icon
              icon="mdi:file-document-outline"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            Templates
          </Button>
        ) : null}

        {onScheduleInspection ? (
          <Button
            type="button"
            variant="primary"
            onClick={onScheduleInspection}
            className={TABLE_HEADER_ACTION_CLASS}
          >
            <Icon
              icon="mdi:plus"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            <span className="sm:hidden">Schedule</span>
            <span className="hidden sm:inline">Schedule Inspection</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
