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
    <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative overflow-hidden rounded-2xl border shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-['']">
      <div className="relative z-1 flex flex-col">
        <div
          className="flex flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6"
          style={{
            backgroundImage:
              "linear-gradient(120.95deg, color-mix(in oklab, var(--ehs-normal-blue) 22%, transparent) 0%, transparent 60%)",
          }}
        >
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href={detailHref}
              aria-label="Back to CAPA detail"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <span
              className="rounded-3.25 bg-ehs-normal-blue inline-flex size-11.5 shrink-0 items-center justify-center shadow-[0px_8px_22px_-8px_var(--ehs-normal-blue)]"
              aria-hidden
            >
              {/* Figma 5472:19849 — outer 46×46, glyph 22×22 */}
              {/* Bespoke glyph with no icon-set equivalent, and next/image
                  does not optimise SVG — it is served verbatim either way. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
                className="text-ehs-normal-blue text-xs font-semibold tracking-[0.04em] uppercase"
              >
                Horizontal Root Cause Analysis
              </Text>
              <Text
                as="h1"
                className="text-5.5 text-ehs-dark-bg leading-7 font-bold tracking-[-0.3px]"
              >
                5 Whys across causal categories → root cause → corrective
                actions
              </Text>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto sm:shrink-0 sm:gap-6">
            <Stat value={String(categories)} label="Categories" />
            <Stat value={String(whySteps)} label="Why steps" />
            <Stat value={String(actions)} label="Actions" />
          </div>
        </div>

        <div className="border-ehs-border-ink/8 grid grid-cols-1 border-t sm:grid-cols-2 md:grid-cols-[minmax(0,200px)_minmax(0,200px)_minmax(0,1fr)]">
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

        <div className="border-ehs-border-ink/8 flex items-start gap-3 border-t px-4 py-4 sm:px-6">
          <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon icon="mdi:text-box-outline" className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Text as="p" className="text-ehs-muted-text text-sm font-medium">
              Incident description
            </Text>
            <p className="text-ehs-dark-bg mt-1 text-base leading-5">
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
      <span className="text-ehs-dark-bg text-2xl leading-none font-bold tabular-nums">
        {value}
      </span>
      <span className="text-ehs-muted-text mt-1 text-sm leading-none">
        {label}
      </span>
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
    <div className="border-ehs-border-ink/8 flex items-center gap-3 px-5 py-4 md:border-r md:last:border-r-0">
      <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon icon={icon} className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Text as="p" className="text-ehs-muted-text text-sm font-medium">
          {label}
        </Text>
        <div className="mt-0.5 flex items-center gap-1">
          <p className="text-ehs-dark-bg truncate text-base font-medium">
            {value}
          </p>
          {showChevron ? (
            <Icon
              icon="mdi:chevron-down"
              className="text-ehs-muted-text size-3.25 shrink-0"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
