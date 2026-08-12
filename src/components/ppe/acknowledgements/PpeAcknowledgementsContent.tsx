"use client";

import { useMemo } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
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
    <div className="border-ehs-border flex w-full flex-col gap-3 rounded-2xl border bg-white/80 p-3.5 shadow-[0px_4px_6px_rgba(15,23,42,0.02)]">
      <div className="flex items-center gap-2">
        <span
          className="text8 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#566072] font-bold text-white"
          aria-hidden="true"
        >
          {entry.initials}
        </span>
        <span className="text4 text-ehs-darker min-w-0 flex-1 truncate">
          {entry.assignToName}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text4 text-ehs-slate">{entry.item}</p>
        <p className="text4 text-ehs-muted-text">
          {`Qty: ${String(entry.quantity)} · Size: ${entry.size}`}
        </p>
        {entry.note.trim() ? (
          <p className="text4 text-ehs-muted-text truncate">{entry.note}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end border-t border-[rgba(11,19,32,0.08)] pt-3">
        {entry.acknowledged ? (
          <IncidentBadge
            label="Acknowledged"
            tone="muted"
            className="w-fit bg-[rgba(16,185,129,0.12)] text-[#10b981]"
          />
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled
            title="Acknowledging PPE from this list is not available yet"
            className="text4 rounded-lg px-3.5 py-1.5 font-semibold shadow-[0px_4px_6px_rgba(8,145,166,0.25)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
                <div className="border-ehs-border h-32 rounded-2xl border bg-white/60" />
              </li>
            ))}
          </ul>
          <PpeTableSkeleton rows={5} columns={6} />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text5 text-ehs-darker tracking-normal">
            Couldn&apos;t load acknowledgements
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text mt-1">
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
                  <Text as="p" className="text4 text-ehs-muted-text">
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
              variant="incident"
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
            <Text as="p" className="text3 text-ehs-darker">
              Verification Guidelines
            </Text>
            <Text as="p" className="text4 text-ehs-gray mt-0.5">
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
