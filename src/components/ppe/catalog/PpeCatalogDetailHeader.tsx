"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { PpeBackLink, PPE_ROUTE } from "@/components/ppe/PpeBackLink";

const crumbMuted = "text-[#b3bbc8] text-sm font-normal";
const crumbLink =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-normal transition-colors";

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
  name: string;
  protectionType: string;
}>;

/** Breadcrumb + title bar above the PPE catalog detail. */
export function PpeCatalogDetailHeader(
  props: Readonly<PpeCatalogDetailHeaderProps>,
) {
  const { name, protectionType } = props;

  return (
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-5.5">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Safety</span>
          <Chevron />
          <Link href={PPE_ROUTE} className={crumbLink}>
            PPE Management
          </Link>
          <Chevron />
          <Link href={PPE_ROUTE} className={crumbLink}>
            Catalog
          </Link>
          <Chevron />
          <span className={`${crumbMuted} truncate`}>{name}</span>
        </nav>

        <div className="flex items-center gap-2">
          <PpeBackLink />
          <div className="flex min-w-0 flex-col gap-1">
            <Text
              as="h1"
              className="text-ehs-darker text-lg font-extrabold tracking-[-0.2px] md:text-5.5 md:font-semibold"
            >
              {name}
            </Text>
            <Text
              as="p"
              className="text-ehs-muted-text text-sm font-medium md:text-base md:leading-[19.5px]"
            >
              {protectionType}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
