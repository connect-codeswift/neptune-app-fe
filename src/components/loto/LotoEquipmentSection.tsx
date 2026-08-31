"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import {
  LOTO_STATUS_FILTERS,
  type LotoStatusFilter,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import type { LotoEquipmentStatusFilterDto } from "@/dtos/req/loto-request.dto";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  DEFAULT_LOTO_PAGE_SIZE,
  useLotoEquipmentQuery,
} from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { withManageAction } from "@/components/ui/table-manage-column";
import type { LotoEquipmentItem } from "@/app/dashboard/lockout-tagout/loto-data";
import { buildLotoEquipmentColumns } from "./LotoEquipmentColumns";
import { LotoQueryStatus } from "./LotoQueryStatus";
import { LotoRegisterHeader } from "./LotoRegisterHeader";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS = LOTO_STATUS_FILTERS.map((filter) => ({
  value: filter.id,
  label: filter.label,
}));

function toStatusDto(status: LotoStatusFilter): LotoEquipmentStatusFilterDto {
  return status === "all" ? "All" : status;
}

export type LotoEquipmentSectionProps = Readonly<{
  onCreateProcedure?: () => void;
}>;

export function LotoEquipmentSection(
  props: Readonly<LotoEquipmentSectionProps>,
) {
  const { onCreateProcedure } = props;
  const router = useRouter();
  const hasToken = useHasAccessToken();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<LotoStatusFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);

  // Debounce search and rewind to page 1 once it settles — a stale page number
  // against a new term would land on an empty slice.
  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
      setPageNumber(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  const equipmentQuery = useLotoEquipmentQuery(
    {
      pageNumber,
      pageSize: DEFAULT_LOTO_PAGE_SIZE,
      search: debouncedQuery.trim(),
      status: toStatusDto(status),
    },
    hasToken === true,
  );

  const columns = useMemo(
    () =>
      withManageAction<LotoEquipmentItem>(
        buildLotoEquipmentColumns({
          onView: (item) => {
            router.push(lotoEquipmentDetailRoute(item.id));
          },
        }),
        {
          getHref: (item) => lotoEquipmentDetailRoute(item.id),
          getAriaLabel: (item) =>
            `Manage equipment ${item.equipmentCode} — ${item.name}`,
        },
      ),
    [router],
  );

  const page = equipmentQuery.data;
  const totalRecords = page?.totalRecords ?? 0;
  const resultLabel = `${String(page?.items.length ?? 0)} of ${String(totalRecords)}`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Status",
            options: STATUS_OPTIONS,
            value: status,
            onChange: (value) => {
              setStatus(value as LotoStatusFilter);
              setPageNumber(1);
            },
          },
        ]}
      />

      <ModuleSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search equipment..."
        aria-label="Search equipment"
        resultLabel={resultLabel}
      />

      {hasToken === null || (hasToken && equipmentQuery.isLoading) ? (
        <LotoQueryStatus state="loading" />
      ) : hasToken === false ? (
        <LotoQueryStatus
          state="error"
          message="Please sign in to load the equipment register."
        />
      ) : equipmentQuery.isError ? (
        <LotoQueryStatus
          state="error"
          message={getMutationErrorMessage(
            equipmentQuery.error,
            "Failed to load the equipment register.",
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
              itemNoun="item"
              itemNounPlural="items"
              actionLabel={onCreateProcedure ? "Create Procedure" : undefined}
              actionIcon="mdi:file-document-outline"
              onAction={onCreateProcedure}
            />
          }
          pagination={{
            pageNumber,
            pageSize: DEFAULT_LOTO_PAGE_SIZE,
            totalRecords,
            onPageChange: setPageNumber,
            isLoading: equipmentQuery.isFetching,
          }}
        />
      )}
    </div>
  );
}
