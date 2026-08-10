"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";

const ISSUANCE_LOG_ROUTE = "/dashboard/ppe-management/issuance-log";
const ACKNOWLEDGEMENTS_ROUTE = "/dashboard/ppe-management/acknowledgements";
const ISSUE_ROUTE = "/dashboard/ppe-management/issue";

export type PpeInventoryHeaderProps = Readonly<{
  onIssuePpe?: () => void;
  /** Elevated roles only — links to the full issuance log. Default true. */
  showViewIssues?: boolean;
}>;

/**
 * Inventory card header — title + View Issues / Employee Acknowledgement /
 * Issue PPE grouped on the right.
 */
export function PpeInventoryHeader(props: Readonly<PpeInventoryHeaderProps>) {
  const { onIssuePpe, showViewIssues = true } = props;
  const router = useRouter();

  const handleIssue = () => {
    if (onIssuePpe) {
      onIssuePpe();
      return;
    }
    router.push(ISSUE_ROUTE);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Text
        as="h3"
        className="text-ehs-darker shrink-0 text-lg font-extrabold md:text-xl md:font-bold"
      >
        Inventory
      </Text>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        {showViewIssues ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={() => {
              router.push(ISSUANCE_LOG_ROUTE);
            }}
            className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
          >
            <Icon
              icon="mdi:clipboard-list-outline"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            View Issues
          </Button>
        ) : null}

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            router.push(ACKNOWLEDGEMENTS_ROUTE);
          }}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon="mdi:check-decagram-outline"
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          Employee Acknowledgement
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={handleIssue}
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon="mdi:plus"
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          Issue PPE
        </Button>
      </div>
    </div>
  );
}
