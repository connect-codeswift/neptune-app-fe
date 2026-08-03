"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const WALK_TALK_ROUTE = "/dashboard/walk-talk";

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

/** Breadcrumb + title bar above the log form. */
export function LogWalkTalkHeader() {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1">
          <span className="text-ehs-muted-text text-sm font-medium">
            Safety
          </span>
          <Chevron />
          <Link href={WALK_TALK_ROUTE} className={crumbClass}>
            Pro-Active Safety
          </Link>
          <Chevron />
          <span className="text-ehs-muted-text text-sm font-medium">
            Walk-and-Talks
          </span>
        </nav>

        <Text
          as="h1"
          className="text-ehs-dark-bg text-[22px] font-semibold tracking-[-0.2px]"
        >
          Walk-and-Talks
        </Text>
      </div>
    </div>
  );
}
