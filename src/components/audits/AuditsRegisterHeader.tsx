"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";

export type AuditsRegisterHeaderProps = Readonly<{
  auditCount?: number;
  onTemplates?: () => void;
  onScheduleAudit?: () => void;
}>;

/** Card header for the audits register table: title + count + actions. */
export function AuditsRegisterHeader(props: AuditsRegisterHeaderProps) {
  const { auditCount, onTemplates, onScheduleAudit } = props;

  return (
    <div className="flex h-12.5 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          Register
        </Text>
        {auditCount != null ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {`${String(auditCount)} ${auditCount === 1 ? "audit" : "audits"}`}
          </Text>
        ) : null}
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

        {onScheduleAudit ? (
          <Button
            type="button"
            variant="primary"
            onClick={onScheduleAudit}
            className={TABLE_HEADER_ACTION_CLASS}
          >
            <Icon
              icon="mdi:plus"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            <span className="sm:hidden">Schedule</span>
            <span className="hidden sm:inline">Schedule Audit</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
