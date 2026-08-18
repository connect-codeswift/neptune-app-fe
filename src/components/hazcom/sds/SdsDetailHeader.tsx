"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import type { HazcomSdsRecord } from "@/components/hazcom/shared";

const SDS_LIBRARY_HREF = "/dashboard/hazcom/sds";

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
  switch (status) {
    case "Compliant":
      return "teal";
    case "Due Soon":
      return "warn";
    case "Overdue":
      return "danger";
    default:
      return "muted";
  }
}

export type SdsDetailHeaderProps = Readonly<{
  record: HazcomSdsRecord;
  pdfUrl?: string | null;
  className?: string;
}>;

/**
 * SDS detail hero — breadcrumbs, title, badges, Download PDF action
 * (aligned with Chemical / Policy detail headers).
 */
export function SdsDetailHeader(props: Readonly<SdsDetailHeaderProps>) {
  const { record, pdfUrl = null, className = "" } = props;

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
        <Link href={SDS_LIBRARY_HREF} className={crumbLink}>
          SDS Library
        </Link>
        <Chevron />
        <span className={`${crumbMuted} truncate`}>{record.id}</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Link
            href={SDS_LIBRARY_HREF}
            aria-label="Back to SDS Library"
            className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>

          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text as="h1" className="text1 text-ehs-darker break-words">
                {record.chemicalName}
              </Text>
              <IncidentBadge
                label={record.signalWord}
                tone={signalTone(record.signalWord)}
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
              <IncidentBadge
                label={record.status}
                tone={statusTone(record.status)}
                showDot
                className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
              />
            </div>
            <Text as="p" className="text8 text-ehs-muted-text">
              {[
                record.id,
                record.version,
                record.manufacturer,
                record.casNumber ? `CAS ${record.casNumber}` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </div>
        </div>

        <div className="flex w-full min-w-0 sm:w-auto sm:justify-end">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-w-0 sm:w-auto"
            >
              <Button
                type="button"
                variant="primary"
                className={actionBaseClass}
              >
                <Icon
                  icon="mdi:tray-arrow-down"
                  className="size-4"
                  aria-hidden="true"
                />
                Download PDF
              </Button>
            </a>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled
              className={actionBaseClass}
            >
              <Icon
                icon="mdi:tray-arrow-down"
                className="size-4"
                aria-hidden="true"
              />
              No PDF attached
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
