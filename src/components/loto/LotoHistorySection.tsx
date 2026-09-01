"use client";

import { useEffect, useMemo, useState } from "react";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import type { LotoLockoutStatusFilterDto } from "@/dtos/req/loto-request.dto";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  DEFAULT_LOTO_PAGE_NUMBER,
  DEFAULT_LOTO_PAGE_SIZE,
  useLotoLockoutHistoryQuery,
} from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { buildLotoHistoryColumns } from "./LotoHistoryColumns";
import { LotoQueryStatus } from "./LotoQueryStatus";
import { LotoRegisterHeader } from "./LotoRegisterHeader";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
] as const;

/** Same narrowing as the equipment register — see isStatusFilter there. */
function isLockoutStatusFilter(
  value: string,
): value is LotoLockoutStatusFilterDto {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

/** Lockout history — POST /api/v1/loto/lockouts/search, the global site-wide log. */
export function LotoHistorySection() {
  const hasToken = useHasAccessToken();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<LotoLockoutStatusFilterDto>("All");
  const [pageNumber, setPageNumber] = useState(DEFAULT_LOTO_PAGE_NUMBER);

  // Trimmed before storing and skipped when unchanged — see the equipment
  // register for why the guard matters.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === debouncedQuery) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(trimmed);
      setPageNumber(DEFAULT_LOTO_PAGE_NUMBER);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query, debouncedQuery]);

  const historyQuery = useLotoLockoutHistoryQuery(
    {
      pageNumber,
      pageSize: DEFAULT_LOTO_PAGE_SIZE,
      search: debouncedQuery,
      status,
    },
    hasToken === true,
  );

  const columns = useMemo(() => buildLotoHistoryColumns(), []);

  const page = historyQuery.data;
  const totalRecords = page?.totalRecords ?? 0;
  const resultLabel = `${String(page?.items.length ?? 0)} of ${String(totalRecords)}`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Status",
            options: [...STATUS_OPTIONS],
            value: status,
            onChange: (value) => {
              if (!isLockoutStatusFilter(value)) return;
              setStatus(value);
              setPageNumber(DEFAULT_LOTO_PAGE_NUMBER);
            },
          },
        ]}
      />

      <ModuleSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by equipment, lock number, log ID or operator..."
        aria-label="Search lockout history"
        resultLabel={resultLabel}
      />

      {hasToken === null || (hasToken && historyQuery.isLoading) ? (
        <LotoQueryStatus state="loading" />
      ) : hasToken === false ? (
        <LotoQueryStatus
          state="error"
          message="Please sign in to load the lockout history."
        />
      ) : historyQuery.isError ? (
        <LotoQueryStatus
          state="error"
          message={getMutationErrorMessage(
            historyQuery.error,
            "Failed to load the lockout history.",
          )}
        />
      ) : (
        <Table
          data={page?.items ?? []}
          columns={columns}
          getRowId={(row) => String(row.id)}
          variant="compliance"
          containerClassName={[complianceGlassCardClass, "min-w-0"].join(" ")}
          header={
            <LotoRegisterHeader
              count={totalRecords}
              itemNoun="record"
              itemNounPlural="records"
            />
          }
          pagination={{
            pageNumber,
            pageSize: DEFAULT_LOTO_PAGE_SIZE,
            totalRecords,
            onPageChange: setPageNumber,
            isLoading: historyQuery.isFetching,
          }}
        />
      )}
    </div>
  );
}
