"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const CHEMICALS_HREF = "/dashboard/hazcom/chemicals";

const crumbMuted = "text8 text-ehs-muted-text";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-2.75 shrink-0 text-[#8892a3]"
      aria-hidden="true"
    />
  );
}

export type ChemicalEditHeaderProps = Readonly<{
  chemicalId?: string;
  chemicalName?: string;
  className?: string;
}>;

/**
 * Edit Chemical hero — breadcrumbs + title (aligned with Hazard / Policy edit).
 */
export function ChemicalEditHeader(props: Readonly<ChemicalEditHeaderProps>) {
  const { chemicalId, chemicalName, className = "" } = props;
  const detailHref =
    chemicalId != null && chemicalId !== ""
      ? `${CHEMICALS_HREF}/${encodeURIComponent(chemicalId)}`
      : null;

  return (
    <div
      className={[
        "rounded-4 backdrop-blur-2.5 before:rounded-4 relative flex flex-col gap-1.5 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3.5 py-3.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-5.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 hidden min-w-0 flex-wrap items-center gap-1 md:flex"
      >
        <span className={crumbMuted}>Safety</span>
        <Chevron />
        <Link href="/dashboard/hazcom/overview" className={crumbLink}>
          HazCom
        </Link>
        <Chevron />
        <Link href={CHEMICALS_HREF} className={crumbLink}>
          Chemical Inventory
        </Link>
        {detailHref ? (
          <>
            <Chevron />
            <Link href={detailHref} className={`${crumbLink} truncate`}>
              {chemicalName ?? chemicalId}
            </Link>
          </>
        ) : null}
        <Chevron />
        <span className={crumbMuted}>Edit</span>
      </nav>

      <div className="relative z-1 flex min-w-0 items-start gap-2">
        <Link
          href={detailHref ?? CHEMICALS_HREF}
          aria-label="Back"
          className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
        >
          <Icon icon="mdi:chevron-left" className="size-3.5" />
        </Link>

        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Edit Chemical
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            {chemicalName
              ? `Update inventory record for ${chemicalName}`
              : "Update this chemical's inventory record"}
          </Text>
        </div>
      </div>
    </div>
  );
}
