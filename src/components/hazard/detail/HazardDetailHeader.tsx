import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import { formatHazardDisplayId } from "@/lib/map-hazard";

const HAZARD_ROUTE = "/dashboard/hazard";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export type HazardDetailHeaderProps = Readonly<{
  record: HazardRecord;
  editHref: string;
  /** Hides the Edit button for roles that may not edit a hazard. */
  canEdit?: boolean;
  action?: React.ReactNode;
}>;

export function HazardDetailHeader(props: Readonly<HazardDetailHeaderProps>) {
  const { record, editHref, canEdit = false, action } = props;
  const displayId = formatHazardDisplayId(record.id);

  return (
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex w-full flex-col justify-center gap-1.5 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <Text as="span" className={crumbMuted}>
          Safety
        </Text>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Link href={HAZARD_ROUTE} className={crumbLink}>
          Hazard Reporting
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Text as="span" className={crumbMuted}>
          {displayId}
        </Text>
      </nav>

      <div className="relative z-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            {displayId}
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            {record.title}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {action}
          {canEdit ? (
            <Link
              href={editHref}
              className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active rounded-2.5 inline-flex shrink-0 items-center justify-center px-8 py-2 font-medium text-ehs-on-accent transition-colors"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
