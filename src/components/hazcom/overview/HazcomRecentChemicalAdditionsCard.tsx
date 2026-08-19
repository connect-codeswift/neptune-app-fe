"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import {
  HazcomBadge,
  type HazcomBadgeTone,
  type HazcomSignalWord,
} from "@/components/hazcom/shared";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { HazcomOverviewState } from "@/hooks/use-hazcom-overview";

function signalWordTone(signalWord: HazcomSignalWord): HazcomBadgeTone {
  return signalWord === "Danger" ? "danger" : "warn";
}

export type HazcomRecentChemicalAdditionsCardProps = Readonly<{
  overview: HazcomOverviewState;
  className?: string;
}>;

/**
 * The newest inventory rows, from the real chemical endpoint.
 *
 * Previously the first four rows of a hard-coded sample — Hydrochloric Acid in
 * "Lab 1 - Room 131" and friends — which named chemicals and storage locations
 * that no site had entered.
 */
export function HazcomRecentChemicalAdditionsCard(
  props: Readonly<HazcomRecentChemicalAdditionsCardProps>,
) {
  const { overview, className = "" } = props;
  const { recentChemicals } = overview;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text3 text-ehs-darker">
          Recent Chemical Additions
        </Text>
        <Link
          href="/dashboard/hazcom/chemicals"
          className="text7 text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-dark-bg rounded-2.5 inline-flex items-center gap-2 px-2 py-1 transition-colors"
        >
          View all
          <Icon
            icon="mdi:arrow-right"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
        </Link>
      </div>

      {recentChemicals.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Icon
            icon="mdi:flask-empty-outline"
            className="text-ehs-muted-text size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text4 text-ehs-muted-text">
            No chemicals on the inventory yet.
          </Text>
          <Link
            href="/dashboard/hazcom/chemicals/new"
            className="text7 text-ehs-normal-blue hover:text-ehs-normal-blue-hover"
          >
            Add the first chemical
          </Link>
        </div>
      ) : (
        <div className="divide-ehs-border mt-4 flex flex-col divide-y">
          {recentChemicals.map((chemical) => (
            <Link
              key={chemical.id}
              href={`/dashboard/hazcom/chemicals/${chemical.id}`}
              className="hover:bg-ehs-light-bg/40 -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors first:mt-1"
            >
              <span className="bg-ehs-surface-inverse/6 text-ehs-gray flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon
                  icon="mdi:flask-outline"
                  className="size-4"
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0 flex-1">
                <Text as="p" className="text4 text-ehs-darker truncate">
                  {chemical.name}
                </Text>
                <Text as="p" className="text8 text-ehs-muted-text truncate">
                  {/* Either field can be blank on a real record, so the
                      separator is only drawn when both sides are present. */}
                  {[
                    chemical.location,
                    chemical.casNumber ? `CAS ${chemical.casNumber}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </div>
              <HazcomBadge
                label={chemical.signalWord.toUpperCase()}
                tone={signalWordTone(chemical.signalWord)}
                className="shrink-0"
              />
            </Link>
          ))}
        </div>
      )}
    </IncidentGlassCard>
  );
}
