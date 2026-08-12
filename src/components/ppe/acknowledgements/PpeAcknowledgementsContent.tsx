"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { PpeAcknowledgementEntry } from "@/app/dashboard/ppe-management/ppe-data";
import { usePpeIssuesAssignedToQuery } from "@/hooks/use-ppe-queries";
import { PpeTableSkeleton } from "../PpeSkeletons";
import { buildPpeAcknowledgementsColumns } from "./PpeAcknowledgementsColumns";
import { PpeAcknowledgementsHeader } from "./PpeAcknowledgementsHeader";

function AcknowledgementMobileCard(
  props: Readonly<{ entry: PpeAcknowledgementEntry }>,
) {
  const { entry } = props;

  return (
    <div className="border-ehs-border flex w-full flex-col gap-3 rounded-xl border bg-white p-3.5 shadow-[0px_2px_4px_rgba(15,23,42,0.02)]">
      <div className="flex items-center gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#566072] text-2.5 font-bold text-white"
          aria-hidden="true"
        >
          {entry.initials}
        </span>
        <span className="text-ehs-darker min-w-0 flex-1 truncate text-sm font-semibold">
          {entry.assignToName}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-ehs-darker text-sm font-semibold">{entry.item}</p>
        <p className="text-ehs-muted-text text-xs">
          {`Qty: ${entry.quantity} · Size: ${entry.size}`}
        </p>
        <p className="truncate text-xs text-[#8892a3]">{entry.note}</p>
      </div>

      <div className="flex items-center justify-end border-t border-[rgba(11,19,32,0.08)] pt-3">
        {entry.acknowledged ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-2.75 font-bold text-[#10b981]">
            <Icon
              icon="mdi:check"
              className="size-2.5 shrink-0"
              aria-hidden="true"
            />
            Acknowledged
          </span>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="pointer-events-none rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-[0px_4px_6px_rgba(8,145,166,0.25)]"
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
}

export function PpeAcknowledgementsContent() {
  const { entries, isLoading, errorMessage, refetch } =
    usePpeIssuesAssignedToQuery();
  const columns = useMemo(() => buildPpeAcknowledgementsColumns(), []);

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <PpeAcknowledgementsHeader />

      {isLoading ? (
        <div
          className="flex flex-col gap-3.5"
          aria-busy="true"
          aria-label="Loading acknowledgements"
        >
          <ul className="flex flex-col gap-3 md:hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={`ack-skel-${String(index)}`}>
                <div className="border-ehs-border h-32 rounded-xl border bg-white/60" />
              </li>
            ))}
          </ul>
          <PpeTableSkeleton rows={5} columns={6} />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Couldn&apos;t load acknowledgements
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
            {errorMessage}
          </Text>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={refetch}
          >
            Try again
          </Button>
        </IncidentGlassCard>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {entries.length === 0 ? (
              <li>
                <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
                  <Text as="p" className="text-ehs-muted-text text-sm">
                    No PPE items assigned to you right now.
                  </Text>
                </IncidentGlassCard>
              </li>
            ) : (
              entries.map((entry) => (
                <li key={entry.id}>
                  <AcknowledgementMobileCard entry={entry} />
                </li>
              ))
            )}
          </ul>

          <div className="hidden min-w-0 overflow-x-auto md:block">
            <Table
              data={entries}
              columns={columns}
              getRowId={(row) => row.id}
              containerClassName="min-w-0"
            />
          </div>

          <IncidentGlassCard
            paddingClassName="p-5"
            className="min-w-0 bg-white/48"
          >
            <Text as="p" className="text-ehs-darker text-base font-bold">
              Verification Guidelines
            </Text>
            <Text as="p" className="mt-0.5 text-sm text-[#566072]">
              By acknowledging assigned PPE, you confirm you have received the
              items, verified their condition, and received training on their
              proper use.
            </Text>
          </IncidentGlassCard>
        </>
      ) : null}
    </div>
  );
}
