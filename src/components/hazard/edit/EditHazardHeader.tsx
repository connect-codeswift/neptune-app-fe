"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

const crumbMuted = "text4 font-normal text-ehs-gray";
const crumbLink =
  "text4 text-ehs-muted-text hover:text-ehs-gray font-normal transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4"
      aria-hidden="true"
    />
  );
}

export function EditHazardHeader(props: Readonly<{ hazardId: string }>) {
  const { hazardId } = props;

  return (
    <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex items-center gap-1"
      >
        <span className={crumbMuted}>Safety</span>
        <Chevron />
        <Link href="/dashboard/hazard" className={crumbLink}>
          Hazards
        </Link>
        <Chevron />
        <Link
          href={`/dashboard/hazard/${encodeURIComponent(hazardId)}`}
          className={crumbLink}
        >
          {hazardId}
        </Link>
        <Chevron />
        <span className={crumbMuted}>Edit</span>
      </nav>

      <div className="relative z-1 flex flex-col gap-0.5">
        <Text as="h1" className="text1 text-ehs-darker">
          Edit Hazard
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {hazardId}
        </Text>
      </div>
    </div>
  );
}