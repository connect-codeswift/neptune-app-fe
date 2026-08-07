"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";

const ISSUANCE_LOG_ROUTE = "/dashboard/ppe-management/issuance-log";
const ACKNOWLEDGEMENTS_ROUTE = "/dashboard/ppe-management/acknowledgements";

export type PpeManagementActionsProps = Readonly<{
  /** Elevated roles only — links to the full issuance log. Default true. */
  showViewIssues?: boolean;
}>;

/** Quick links under PPE metrics — View Issues + Employee Acknowledgement. */
export function PpeManagementActions(
  props: Readonly<PpeManagementActionsProps>,
) {
  const { showViewIssues = true } = props;
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {showViewIssues ? (
        <Button
          type="button"
          variant="tertiary"
          onClick={() => {
            router.push(ISSUANCE_LOG_ROUTE);
          }}
          className="w-full gap-2 rounded-[10px] px-4 py-2.5 text-base! font-medium sm:w-auto"
        >
          <Icon icon="mdi:clipboard-list-outline" className="size-4 shrink-0" />
          View Issues
        </Button>
      ) : null}
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          router.push(ACKNOWLEDGEMENTS_ROUTE);
        }}
        className="w-full gap-2 rounded-[10px] px-4 py-2.5 text-base! font-semibold shadow-[0px_6px_18px_-6px_#0891a6] sm:w-auto"
      >
        <Icon icon="mdi:check-decagram-outline" className="size-4 shrink-0" />
        Employee Acknowledgement
      </Button>
    </div>
  );
}
