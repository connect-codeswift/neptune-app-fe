"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import type { HazcomChemical } from "@/components/hazcom/shared";

const CHEMICALS_HREF = "/dashboard/hazcom/chemicals";

const crumbMuted = "text8 text-ehs-muted-text";
const crumbLink =
  "text8 text-ehs-muted-text hover:text-ehs-gray transition-colors";

const actionBaseClass =
  "text4 h-9 w-full rounded-2.5 px-3 sm:h-9.5 sm:w-auto sm:px-3";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-2.75 shrink-0 text-[#8892a3]"
      aria-hidden="true"
    />
  );
}

function signalTone(signalWord: string): IncidentBadgeTone {
  return signalWord.trim().toLowerCase() === "danger" ? "danger" : "warn";
}

function statusTone(status: string): IncidentBadgeTone {
  return status.trim().toLowerCase() === "active" ? "teal" : "muted";
}

export type ChemicalDetailHeaderProps = Readonly<{
  chemical: HazcomChemical;
  className?: string;
}>;

/**
 * Chemical detail hero — breadcrumbs, title, actions (aligned with Policy /
 * Hazard / PPE detail headers).
 */
export function ChemicalDetailHeader(
  props: Readonly<ChemicalDetailHeaderProps>,
) {
  const { chemical, className = "" } = props;

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
        <Chevron />
        <span className={`${crumbMuted} truncate`}>{chemical.id}</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Link
            href={CHEMICALS_HREF}
            aria-label="Back to Chemical Inventory"
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>

          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text as="h1" className="text1 text-ehs-darker break-words">
                {chemical.name}
              </Text>
              <IncidentBadge
                label={chemical.signalWord}
                tone={signalTone(chemical.signalWord)}
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
              <IncidentBadge
                label={chemical.status}
                tone={statusTone(chemical.status)}
                showDot
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
            </div>
            <Text as="p" className="text8 text-ehs-muted-text">
              {`CAS ${chemical.casNumber} · ${chemical.hazardClass} · ${chemical.location}`}
            </Text>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <Link
            href={`/dashboard/hazcom/chemicals/${encodeURIComponent(chemical.id)}/edit`}
            className="min-w-0"
          >
            <Button
              type="button"
              variant="tertiary"
              className={`${actionBaseClass} border border-[rgba(11,19,32,0.14)] text-[#0b1320] shadow-none`}
            >
              <Icon
                icon="mdi:pencil-outline"
                className="size-4"
                aria-hidden="true"
              />
              Edit
            </Button>
          </Link>
          <Link href="/dashboard/hazcom/labels" className="min-w-0">
            <Button type="button" variant="primary" className={actionBaseClass}>
              <Icon
                icon="mdi:printer-outline"
                className="size-4"
                aria-hidden="true"
              />
              Generate Label
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
