"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import {
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import type {
  PpeIssuanceLogEntry,
  PpeLogStatus,
} from "@/app/dashboard/ppe-management/ppe-data";
import { toast } from "@/lib/toast";
import { usePpeIssuesByStatusQuery } from "@/hooks/use-ppe-queries";
import { buildPpeIssuanceLogColumns } from "./PpeIssuanceLogColumns";
import { PpeIssuanceLogHeader } from "./PpeIssuanceLogHeader";
import { exportIssuanceLogToCsv } from "./export-issuance-log-csv";
import { PpeIssuanceLogSkeleton } from "../PpeSkeletons";

const PROFILE_ROUTE = "/dashboard/ppe-management/profile";

type LogStatusFilter = "all" | "active" | "returned";

const statusToneClass: Record<PpeLogStatus, string> = {
  Issued: "bg-ehs-green/10 text-ehs-green",
  "Due Inspection": "bg-ehs-yellow/10 text-ehs-yellow",
  Overdue: "bg-ehs-red/10 text-ehs-red",
  Returned: "bg-ehs-gray/10 text-ehs-gray",
};

const statusLabel: Record<PpeLogStatus, string> = {
  Issued: "ACTIVE",
  "Due Inspection": "DUE",
  Overdue: "OVERDUE",
  Returned: "RETURNED",
};

function matchesSearch(entry: PpeIssuanceLogEntry, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    entry.issueId,
    entry.employee,
    entry.ppeItem,
    entry.qtySize,
    entry.condition,
    entry.status,
  ].some((field) => field.toLowerCase().includes(needle));
}

function matchesStatusFilter(
  entry: PpeIssuanceLogEntry,
  filter: LogStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "returned") return entry.status === "Returned";
  return entry.status !== "Returned";
}

function IssuanceLogTableHeader(
  props: Readonly<{
    onExportCsv: () => void;
  }>,
) {
  const { onExportCsv } = props;

  return (
    <div className="flex h-[51px] flex-wrap items-center justify-between gap-3">
      <Text as="h2" className="text3 text-ehs-darker shrink-0">
        Issuance log
      </Text>

      <Button
        type="button"
        variant="tertiary"
        onClick={onExportCsv}
        className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
      >
        <Icon
          icon="mdi:download"
          className={TABLE_HEADER_ACTION_ICON_CLASS}
          aria-hidden="true"
        />
        Export CSV
      </Button>
    </div>
  );
}

function IssuanceLogMobileCard(
  props: Readonly<{
    entry: PpeIssuanceLogEntry;
    onOpen: () => void;
  }>,
) {
  const { entry, onOpen } = props;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-3 rounded-2xl border bg-ehs-surface/80 p-3.5 text-left shadow-[0px_4px_6px_rgba(15,23,42,0.02)]"
    >
      <div className="flex items-center gap-2">
        <span className="text7 text-ehs-gray rounded-full bg-ehs-surface-inverse/6 px-2 py-0.5">
          {entry.issueId}
        </span>
        <span className="text4 text-ehs-darker min-w-0 flex-1 truncate">
          {entry.employee}
        </span>
        <span
          className={`text8 shrink-0 rounded-md px-2 py-0.5 ${statusToneClass[entry.status]}`}
        >
          {statusLabel[entry.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text4 text-ehs-slate">{entry.ppeItem}</p>
        <p className="text4 text-ehs-muted-text">
          {`Qty: ${entry.qtySize.replace(" × ", " · Size: ")}`}
        </p>
        <p className="text4 text-ehs-muted-text inline-flex items-center gap-1">
          <Icon icon="mdi:calendar-outline" className="size-3 shrink-0" />
          {`Issued: ${entry.issueDate}`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ehs-border-ink/8 pt-3">
        <p className="text4 text-ehs-muted-text">
          Condition:{" "}
          <span className="text7 text-ehs-gray rounded-full bg-ehs-surface-inverse/6 px-2 py-0.5">
            {entry.condition}
          </span>
        </p>
        {entry.canReturn ? (
          <span
            className="text4 text-ehs-muted-text"
            title="Recording returns is not available yet"
          >
            Return unavailable
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function PpeIssuanceLogContent(
  props: Readonly<{ embedded?: boolean }> = {},
) {
  const { embedded = false } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LogStatusFilter>("all");
  const { entries, isLoading, errorMessage, refetch } =
    usePpeIssuesByStatusQuery();

  const openProfile = (entry: PpeIssuanceLogEntry) => {
    router.push(`${PROFILE_ROUTE}/${encodeURIComponent(entry.id)}`);
  };

  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          matchesSearch(entry, query) &&
          matchesStatusFilter(entry, statusFilter),
      ),
    [entries, query, statusFilter],
  );

  const columns = useMemo(() => buildPpeIssuanceLogColumns(), []);

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "issuance" : "issuances"
  }`;

  const filterChips: ReadonlyArray<{ id: LogStatusFilter; label: string }> = [
    { id: "all", label: resultLabel },
    { id: "active", label: "All Active" },
    { id: "returned", label: "Returned" },
  ];

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No issuances to export");
      return;
    }
    exportIssuanceLogToCsv(filtered);
    toast.success("CSV downloaded");
  };

  const tableHeader = <IssuanceLogTableHeader onExportCsv={handleExportCsv} />;

  return (
    <div
      className={
        embedded
          ? "flex min-w-0 flex-col gap-3.5"
          : "flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4"
      }
    >
      <PpeIssuanceLogHeader embedded={embedded} />

      {isLoading ? <PpeIssuanceLogSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text4 text-ehs-darker">
            Couldn&apos;t load the issuance log
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full min-w-0 sm:w-96">
              <Icon
                icon="mdi:magnify"
                className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="Search by name, item, issue ID..."
                aria-label="Search issuance log"
                className={`${FIELD_INPUT_LG_CLASS} pl-9`}
              />
            </div>
            <span className="text8 text-ehs-muted-text hidden shrink-0 md:inline">
              {resultLabel}
            </span>
          </div>

          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 md:hidden"
            role="tablist"
            aria-label="Issuance status filter"
          >
            {filterChips.map((chip) => {
              const isActive = statusFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setStatusFilter(chip.id);
                  }}
                  className={[
                    "text8 rounded-5 shrink-0 cursor-pointer px-3 py-1.5 whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-ehs-normal-blue text-ehs-on-accent"
                      : "border-ehs-border text-ehs-muted-text border bg-ehs-surface",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Mobile — same toolbar as the table header */}
          <div className="flex flex-col gap-3 md:hidden">
            {tableHeader}
            {filtered.length === 0 ? (
              <p className="text4 text-ehs-muted-text">No issuances found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtered.map((entry) => (
                  <li key={entry.id}>
                    <IssuanceLogMobileCard
                      entry={entry}
                      onOpen={() => {
                        openProfile(entry);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop — inventory / catalog compliance table chrome */}
          <div className="hidden min-w-0 overflow-x-auto md:block">
            <Table
              variant="compliance"
              data={filtered}
              columns={columns}
              getRowId={(row) => row.id}
              onRowClick={openProfile}
              containerClassName={complianceGlassCardClass}
              header={tableHeader}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
