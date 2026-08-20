"use client";

import Link from "next/link";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import {
  IH_BASE_PATH,
  IH_RECENT_EXCEEDANCES,
} from "@/components/industrial-hygiene/ih-dashboard-data";

/** Recent Exceedances card — Figma 5298:22288. */
export function IhRecentExceedancesCard() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-1"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
          Recent Exceedances
        </Text>
        <Link
          href={`${IH_BASE_PATH}/monitoring-records`}
          className="hover:text-ehs-normal-blue text-ehs-dark-bg text-sm transition-colors"
        >
          View all →
        </Link>
      </div>

      <ul className="flex flex-col">
        {IH_RECENT_EXCEEDANCES.map((item) => (
          <li
            key={item.id}
            className="border-ehs-border-ink/6 flex items-start gap-3 border-b py-3 last:border-b-0 last:pb-0"
          >
            <span
              className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg"
              aria-hidden
            >
              {/* Figma 5298:22293 — alert-triangle outline, 16×16 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/industrial-hygiene/alert-triangle.svg"
                alt=""
                width={16}
                height={16}
                className="size-5"
              />
            </span>
            <div className="min-w-0 flex-1">
              <Text
                as="p"
                className="text-ehs-dark-bg text-base leading-5 font-semibold"
              >
                {item.title}
              </Text>
              <Text
                as="p"
                className="text-ehs-muted-text mt-1 text-sm leading-4"
              >
                {item.detail}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </IncidentGlassCard>
  );
}
