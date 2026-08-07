"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type IncidentListHeaderProps = Readonly<{
  title?: string;
  /** Primary CTA href (incidents report, document upload, etc.). */
  reportHref?: string;
  /** Primary CTA label. Defaults to ΓÇ£Report incidentΓÇ¥. */
  actionLabel?: string;
  /** Short label for small screens. Defaults to first word of actionLabel / ΓÇ£ReportΓÇ¥. */
  actionLabelShort?: string;
  /** Hides the primary CTA button entirely (e.g. read-only register screens). */
  showAction?: boolean;
  className?: string;
}>;

export function IncidentListHeader(props: Readonly<IncidentListHeaderProps>) {
  const {
    title = "Incidents",
    reportHref = "/dashboard/incidents/report",
    actionLabel = "Report incident",
    actionLabelShort,
    showAction = true,
    className = "",
  } = props;

  const shortLabel =
    actionLabelShort ?? actionLabel.split(/\s+/)[0] ?? "Report";

  return (
    <header
      className={[
        "flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <Text
          as="h1"
          className="text-ehs-darker shrink-0 text-2xl font-bold tracking-tight"
        >
          {title}
        </Text>
      ) : null}

      {showAction ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:ml-auto lg:justify-end">
          <Link href={reportHref} className="min-w-0 sm:shrink-0">
            <Button
              type="button"
              variant="primary"
              className="w-full rounded-lg px-3 py-2 text-sm sm:w-auto sm:px-4"
            >
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{actionLabel}</span>
            </Button>
          </Link>
        </div>
      ) : null}
    </header>
  );
}
