"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { IncidentGlassCard } from "@/components/incidents";
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

const ISSUE_ROUTE = "/dashboard/ppe-management/issue";
const PROFILE_ROUTE = "/dashboard/ppe-management/profile";

type LogStatusFilter = "all" | "active" | "returned";

const statusToneClass: Record<PpeLogStatus, string> = {
  Issued: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  "Due Inspection": "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]",
  Overdue: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
  Returned: "bg-[rgba(86,96,114,0.1)] text-[#566072]",
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
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-3 rounded-xl border bg-white p-3.5 text-left shadow-[0px_2px_4px_rgba(15,23,42,0.02)]"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[11px] font-bold text-[#566072]">
          {entry.issueId}
        </span>
        <span className="text-ehs-darker min-w-0 flex-1 truncate text-sm font-bold">
          {entry.employee}
        </span>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${statusToneClass[entry.status]}`}
        >
          {statusLabel[entry.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-ehs-darker text-sm font-bold">{entry.ppeItem}</p>
        <p className="text-ehs-muted-text text-xs font-medium">
          {`Qty: ${entry.qtySize.replace(" × ", " · Size: ")}`}
        </p>
        <p className="text-ehs-muted-text inline-flex items-center gap-1 text-xs font-medium">
          <Icon icon="mdi:calendar-outline" className="size-3 shrink-0" />
          {`Issued: ${entry.issueDate}`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[rgba(11,19,32,0.08)] pt-3">
        <p className="text-ehs-muted-text text-xs">
          Condition:{" "}
          <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 font-semibold text-[#566072]">
            {entry.condition}
          </span>
        </p>
        {/* Recording a return has no endpoint yet (use-ppe-mutations covers
            issue and replacement only), and this used to toast "Return
            recorded" without saving anything. Shown as unavailable rather than
            actionable — and as plain text, since an interactive control nested
            inside this card's own button was invalid markup and unreachable by
            keyboard in a predictable order. The desktop table already has its
            Return column disabled. */}
        {entry.canReturn ? (
          <span
            className="text-ehs-muted-text text-sm font-semibold"
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

  // No onReturn handler: the table's Return column is disabled while the
  // endpoint is missing, so passing one only wired up a fake success toast.
  const columns = useMemo(() => buildPpeIssuanceLogColumns(), []);

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "issuance" : "issuances"
  }`;

  const filterChips: ReadonlyArray<{ id: LogStatusFilter; label: string }> = [
    { id: "all", label: resultLabel },
    { id: "active", label: "All Active" },
    { id: "returned", label: "Returned" },
  ];

  return (
    <div
      className={
        embedded
          ? "flex min-w-0 flex-col gap-3.5"
          : "flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4"
      }
    >
      <PpeIssuanceLogHeader
        embedded={embedded}
        onExportCsv={() => {
          if (filtered.length === 0) {
            toast.error("No issuances to export");
            return;
          }
          exportIssuanceLogToCsv(filtered);
          toast.success("CSV downloaded");
        }}
        onIssuePpe={() => {
          router.push(ISSUE_ROUTE);
        }}
      />

      {isLoading ? <PpeIssuanceLogSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Couldn&apos;t load the issuance log
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
                className="border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-xl border bg-white py-2.5 pr-3 pl-9 shadow-sm transition outline-none focus:ring-2"
              />
            </div>
            <span className="text-ehs-muted-text hidden shrink-0 text-base md:inline">
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
                    "shrink-0 cursor-pointer rounded-[20px] px-3 py-1.5 text-[11px] whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-ehs-normal-blue font-bold text-white"
                      : "border-ehs-border text-ehs-muted-text border bg-white font-medium",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">No issuances found.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-3 md:hidden">
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

              <div className="hidden min-w-0 overflow-x-auto md:block">
                <Table
                  data={filtered}
                  columns={columns}
                  getRowId={(row) => row.id}
                  onRowClick={openProfile}
                  containerClassName="min-w-0"
                />
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
