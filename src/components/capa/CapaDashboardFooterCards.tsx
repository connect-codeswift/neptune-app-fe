"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";
import {
  CAPA_OWNER_WORKLOAD,
  CAPA_PENDING_REVIEWS,
} from "@/components/capa/capa-dashboard-data";

/** Workload + pending verification — Figma 7123:42581. */
export function CapaDashboardFooterCards() {
  const maxOpen = Math.max(
    ...CAPA_OWNER_WORKLOAD.map((owner) => owner.openCount),
    1,
  );

  return (
    <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
      <IncidentGlassCard paddingClassName="p-[21px]" className="min-w-0">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <Text
              as="h3"
              className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
            >
              Workload by Owner
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              Open CAPAs
            </Text>
          </div>
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-darker inline-flex items-center gap-1 text-xs font-semibold"
            onClick={() => toast.info("Owner workload list coming soon")}
          >
            View all
            <Icon icon="mdi:chevron-right" className="size-3.5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-4">
          {CAPA_OWNER_WORKLOAD.map((owner) => (
            <li key={owner.name}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-ehs-darker text-sm font-medium">
                  {owner.name}
                </span>
                <span className="text-ehs-muted-text text-sm tabular-nums">
                  {String(owner.openCount)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                <div
                  className="h-full rounded-full bg-[#0891a6]"
                  style={{
                    width: `${String((owner.openCount / maxOpen) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </IncidentGlassCard>

      <IncidentGlassCard paddingClassName="p-[21px]" className="min-w-0">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <Text
              as="h3"
              className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
            >
              Awaiting Effectiveness Review
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              Closed actions pending verification
            </Text>
          </div>
          <span className="inline-flex rounded-full bg-[rgba(245,158,11,0.14)] px-2.5 py-1 text-xs font-semibold text-[#d97706]">
            {`${String(CAPA_PENDING_REVIEWS.length)} pending`}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {CAPA_PENDING_REVIEWS.map((review) => (
            <li
              key={review.id}
              className="flex items-center gap-3 border-b border-[rgba(15,23,42,0.06)] py-3 last:border-b-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(245,158,11,0.14)] text-[#d97706]">
                <Icon icon="mdi:clipboard-check-outline" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ehs-darker truncate text-sm font-medium">
                  {review.title}
                </p>
                <p className="text-ehs-muted-text truncate text-xs">
                  {review.meta}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm"
                onClick={() => toast.info(`Verify ${review.id} coming soon`)}
              >
                Verify →
              </Button>
            </li>
          ))}
        </ul>
      </IncidentGlassCard>
    </div>
  );
}
