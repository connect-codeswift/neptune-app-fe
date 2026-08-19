"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { formatHazardDisplayId } from "@/lib/map-hazard";

const HAZARD_ROUTE = "/dashboard/hazard";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

export type EditHazardHeaderProps = Readonly<{
  hazardId: string;
}>;

export function EditHazardHeader(props: Readonly<EditHazardHeaderProps>) {
  const { hazardId } = props;
  const displayId = formatHazardDisplayId(hazardId);
  const detailHref = `${HAZARD_ROUTE}/${encodeURIComponent(hazardId)}`;

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
        <Link href={detailHref} className={crumbLink}>
          {displayId}
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Text as="span" className={crumbMuted}>
          Edit
        </Text>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Edit Hazard
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {displayId}
        </Text>
      </div>
    </div>
  );
}
