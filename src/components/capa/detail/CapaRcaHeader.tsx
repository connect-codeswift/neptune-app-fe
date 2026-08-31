"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";

const CAPA_ROUTE = "/dashboard/capa";

export type CapaRcaHeaderProps = Readonly<{
  record: CapaDetailRecord;
  categories: number;
  whySteps: number;
  actions: number;
}>;

/** Horizontal RCA hero — Figma 5472:19846 (title + meta + description). */
export function CapaRcaHeader(props: CapaRcaHeaderProps) {
  const { record, categories, whySteps, actions } = props;
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

