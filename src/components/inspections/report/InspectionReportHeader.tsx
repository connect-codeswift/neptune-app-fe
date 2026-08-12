"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

const actionClass = "text4 h-9 rounded-2.5 px-3 sm:h-9.5";

export type InspectionReportHeaderProps = Readonly<{
  inspectionId: string;
  subtitle: string;
  onExportPdf?: () => void;
  /** True while the PDF is being generated. */
  isExporting?: boolean;
}>;

export function InspectionReportHeader(props: InspectionReportHeaderProps) {
  const { inspectionId, subtitle, onExportPdf, isExporting = false } = props;

  return (
    <div className="backdrop-blur-2.5 relative flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-6">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1"
        >
          <span className={crumbMuted}>Compliance</span>
          <Icon
            icon="mdi:chevron-right"
            className="size-3 shrink-0 text-[#8892a3]"
            aria-hidden="true"
          />
          <Link href="/dashboard/inspections" className={crumbLink}>
            Inspections
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="size-3 shrink-0 text-[#8892a3]"
            aria-hidden="true"
          />
          <span className={`${crumbMuted} truncate`}>{inspectionId}</span>
          <Icon
            icon="mdi:chevron-right"
            className="size-3 shrink-0 text-[#8892a3]"
            aria-hidden="true"
          />
          <span className={crumbMuted}>Report</span>
        </nav>

        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Inspection Report
          </Text>
          {subtitle ? (
            <Text as="p" className="text8 text-ehs-muted-text">
              {subtitle}
            </Text>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onExportPdf}
        disabled={isExporting || !onExportPdf}
        className={`${actionClass} relative z-1 shrink-0 !border-transparent !shadow-none disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isExporting ? "Exporting…" : "Export PDF"}
      </Button>
    </div>
  );
}
