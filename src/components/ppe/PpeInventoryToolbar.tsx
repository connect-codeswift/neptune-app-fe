"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

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

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
        {showViewIssues ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={() => {
              router.push(ISSUANCE_LOG_ROUTE);
            }}
            className="shrink-0 gap-1 rounded-lg px-3 py-1.5 md:gap-2 md:rounded-[10px] md:px-3.5 md:py-2"
          >
            <Icon
              icon="mdi:clipboard-list-outline"
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="whitespace-nowrap">View Issues</span>
          </Button>
        ) : null}

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            router.push(ACKNOWLEDGEMENTS_ROUTE);
          }}
          className="shrink-0 gap-1 rounded-lg px-3 py-1.5 md:gap-2 md:rounded-[10px] md:px-3.5 md:py-2"
        >
          <Icon
            icon="mdi:check-decagram-outline"
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">Employee Acknowledgement</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={handleIssue}
          className="shrink-0 gap-1 rounded-lg px-3 py-1.5 md:gap-2 md:rounded-[10px] md:px-3.5 md:py-2"
        >
          <Icon
            icon="mdi:plus"
            className="size-3 shrink-0 md:size-3.5"
            aria-hidden="true"
          />
          <span className="text-xs font-bold whitespace-nowrap md:text-base">
            Issue PPE
          </span>
        </Button>
      </div>
    </div>
  );
}
