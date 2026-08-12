import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

const crumbMuted = "text4 font-normal text-ehs-gray";
const crumbLink =
  "text4 text-ehs-muted-text hover:text-ehs-gray font-normal transition-colors";

export function HazardDetailHeader(
  props: Readonly<{
    record: HazardRecord;
    editHref: string;
    /** Hides the Edit button for roles that may not edit a hazard. */
    canEdit?: boolean;
    action?: React.ReactNode;
  }>,
) {
  const { record, editHref, canEdit = false, action } = props;

  return (
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex items-center gap-1"
      >
        <span className={crumbMuted}>Safety</span>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-4"
          aria-hidden="true"
        />
        <Link href="/dashboard/hazard" className={crumbLink}>
          Hazard Reporting
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-4"
          aria-hidden="true"
        />
        <span className={crumbMuted}>{record.id}</span>
      </nav>

      <div className="relative z-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            {record.id}
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text">
            {record.title}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {action}
          {canEdit ? (
            <Link
              href={editHref}
              className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active inline-flex shrink-0 items-center justify-center rounded-2.5 px-8 py-2 font-medium text-white transition-colors"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
