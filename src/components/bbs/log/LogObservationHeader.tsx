"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4"
      aria-hidden="true"
    />
  );
}

/** Breadcrumb + title bar above the wizard. */
export function LogObservationHeader() {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-6 md:py-4">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 overflow-x-auto md:flex"
        >
          <span className="text-ehs-muted-text text-sm font-medium">
            Safety
          </span>
          <Chevron />
          <Link href="/dashboard/bbs" className={crumbClass}>
            Observations
          </Link>
          <Chevron />
          <span className="text-ehs-muted-text text-sm font-medium">New</span>
        </nav>

        <div className="flex items-center gap-2 md:block">
          <Link
            href="/dashboard/bbs"
            aria-label="Back to observations"
            className="border-ehs-border text-ehs-dark-bg hover:bg-slate-50 flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors md:hidden"
          >
            <Icon icon="mdi:chevron-left" className="size-3.5" />
          </Link>
          <Text
            as="h1"
            className="text-ehs-dark-bg text-base font-bold tracking-[-0.2px] md:text-2xl md:font-semibold"
          >
            Log BBS Observation
          </Text>
        </div>
      </div>
    </div>
  );
}
