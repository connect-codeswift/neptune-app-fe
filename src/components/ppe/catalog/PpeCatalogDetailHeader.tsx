"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { PPE_ROUTE } from "@/components/ppe/PpeBackLink";
import { formatPpeDisplayId } from "@/lib/map-ppe";

const crumbMuted = "text8 text-ehs-muted-text";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-3 shrink-0"
      aria-hidden="true"
    />
  );
}

export type PpeCatalogDetailHeaderProps = Readonly<{
  id?: string;
  name: string;
  protectionType: string;
}>;

/** Breadcrumb + title bar above the PPE catalog detail. */
export function PpeCatalogDetailHeader(
  props: Readonly<PpeCatalogDetailHeaderProps>,
) {
  const { id, name, protectionType } = props;
  const displayId = id ? formatPpeDisplayId(id) : "";
  const subtitle = [displayId, protectionType]
    .filter((part) => part.trim() !== "")
    .join(" · ");
  const crumbLabel = displayId || name;

  return (
    <IncidentGlassCard paddingClassName="px-4 py-3 md:px-5" className="min-w-0">
      <nav
        aria-label="Breadcrumb"
        className="mb-1.5 hidden items-center gap-1.5 overflow-x-auto md:flex"
      >
        <span className={crumbMuted}>Safety</span>
        <Chevron />
        <Link href={PPE_ROUTE} className={crumbLink}>
          PPE Management
        </Link>
        <Chevron />
        <span className={`${crumbMuted} truncate`}>{crumbLabel}</span>
      </nav>

      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          {name}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {subtitle}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
