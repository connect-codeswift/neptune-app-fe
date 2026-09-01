"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Can } from "@/components/auth/Can";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

const REPORT_ROUTE = "/dashboard/incidents/report";
const DRAFTS_ROUTE = "/dashboard/incidents/drafts";

export type IncidentListTableHeaderProps = Readonly<{
  title?: string;
  className?: string;
}>;

/** Title + Report incident bar above the incident register column headers. */
export function IncidentListTableHeader(
  props: Readonly<IncidentListTableHeaderProps>,
) {
  const { title = "Incidents", className = "" } = props;
  const router = useRouter();

  return (
    <div
      className={[
        "border-ehs-border-ink/8 flex h-12.5 flex-wrap items-center justify-between gap-3 border-b px-4 sm:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h2"
        className="text-ehs-dark-bg shrink-0 text-xs leading-none font-bold"
      >
        {title}
      </Text>

      {/* Hidden for a role without Incident.Create rather than shown and refused on
          submit. The API is what actually enforces it — this only removes the dead end. */}
      <Can do="Incident.Create">
        <div className="flex items-center gap-2">
          {/* Drafts sit beside the entry point to the wizard that produces them, and
              under the same permission: they are unfinished reports, so anyone who
              cannot file a report has none. */}
          <Button
            type="button"
            variant="tertiary"
            onClick={() => {
              router.push(DRAFTS_ROUTE);
            }}
            className={TABLE_HEADER_ACTION_CLASS}
          >
            <Icon
              icon="mdi:file-document-edit-outline"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            Drafts
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              router.push(REPORT_ROUTE);
            }}
            className={TABLE_HEADER_ACTION_CLASS}
          >
            <Icon
              icon="mdi:plus"
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            Report incident
          </Button>
        </div>
      </Can>
    </div>
  );
}
