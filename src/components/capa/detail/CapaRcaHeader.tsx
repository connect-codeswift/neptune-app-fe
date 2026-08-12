"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";
import type { CapaRcaWorksheet } from "@/components/capa/detail/capa-rca-data";

const CAPA_ROUTE = "/dashboard/capa";

export type CapaRcaHeaderProps = Readonly<{
  record: CapaDetailRecord;
  worksheet: CapaRcaWorksheet;
  categories: number;
  whySteps: number;
  actions: number;
}>;

/** Horizontal RCA hero — Figma 5472:19846 (title + meta + description). */
export function CapaRcaHeader(props: CapaRcaHeaderProps) {
  const { record, worksheet, categories, whySteps, actions } = props;
  const detailHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex flex-col">
        <div
          className="flex flex-wrap items-start justify-between gap-4 px-6 py-5"
          style={{
            backgroundImage:
              "linear-gradient(120.95deg, rgba(8, 145, 166, 0.22) 0%, rgba(8, 145, 166, 0) 60%)",
          }}
        >
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href={detailHref}
              aria-label="Back to CAPA detail"
              className="border-ehs-border text-ehs-dark-bg flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <span
              className="inline-flex size-11.5 shrink-0 items-center justify-center rounded-[13px] bg-[#0891a6] shadow-[0px_8px_22px_-8px_#0891a6]"
              aria-hidden
            >
              {/* Figma 5472:19849 — outer 46×46, glyph 22×22 */}
              <img
                src="/icons/capa/rca-horizontal.svg"
                alt=""
                width={22}
                height={22}
                className="size-5.5"
              />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <Text
                as="p"
                className="text-xs font-semibold tracking-[0.04em] text-[#0891a6] uppercase"
              >
                Horizontal Root Cause Analysis
              </Text>
              <Text
                as="h1"
                className="text-[22px] leading-7 font-bold tracking-[-0.3px] text-[#0b1320]"
              >
                5 Whys across causal categories → root cause → corrective
                actions
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <Stat value={String(categories)} label="Categories" />
            <Stat value={String(whySteps)} label="Why steps" />
            <Stat value={String(actions)} label="Actions" />
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-[rgba(15,23,42,0.08)] md:grid-cols-[200px_200px_minmax(0,1fr)]">
          <MetaCell
            icon="mdi:file-document-outline"
            label="Type of report"
            value={worksheet.reportType}
            showChevron
          />
          <MetaCell
            icon="mdi:calendar-outline"
            label="Date"
            value={worksheet.date}
          />
          <MetaCell
            icon="mdi:bandage"
            label="Injury"
            value={worksheet.injury}
          />
        </div>

        <div className="flex items-start gap-3 border-t border-[rgba(15,23,42,0.08)] px-6 py-4">
          <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon icon="mdi:text-box-outline" className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Text as="p" className="text-sm font-medium text-[#8892a3]">
              Incident description
            </Text>
            <p className="mt-1 text-base leading-5 text-[#0b1320]">
              {worksheet.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat(props: Readonly<{ value: string; label: string }>) {
  const { value, label } = props;
  return (
    <div className="flex min-w-12 flex-col items-center">
      <span className="text-2xl leading-none font-bold text-[#0b1320] tabular-nums">
        {value}
      </span>
      <span className="mt-1 text-sm leading-none text-[#8892a3]">{label}</span>
    </div>
  );
}

function MetaCell(
  props: Readonly<{
    icon: string;
    label: string;
    value: string;
    showChevron?: boolean;
  }>,
) {
  const { icon, label, value, showChevron = false } = props;

  return (
    <div className="flex items-center gap-3 border-[rgba(15,23,42,0.08)] px-5 py-4 md:border-r md:last:border-r-0">
      <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon icon={icon} className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Text as="p" className="text-sm font-medium text-[#8892a3]">
          {label}
        </Text>
        <div className="mt-0.5 flex items-center gap-1">
          <p className="truncate text-base font-medium text-[#0b1320]">
            {value}
          </p>
          {showChevron ? (
            <Icon
              icon="mdi:chevron-down"
              className="size-3.25 shrink-0 text-[#8892a3]"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
