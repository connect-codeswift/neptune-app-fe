"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import { LOTO_STATUS_FILTERS } from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import type { LotoEquipmentStatusFilterDto } from "@/dtos/req/loto-request.dto";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useCapabilities } from "@/lib/capabilities";
import {
  DEFAULT_LOTO_PAGE_NUMBER,
  DEFAULT_LOTO_PAGE_SIZE,
  useLotoEquipmentQuery,
} from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { toast } from "@/lib/toast";
import { withRowLink } from "@/components/ui/table-row-link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { stripEquipmentPrefix } from "@/services/mappers/loto.mapper";
import { useDropLotoEquipmentMutation } from "@/hooks/use-loto-mutations";
import type { LotoEquipmentItem } from "@/app/dashboard/lockout-tagout/loto-data";
import { buildLotoEquipmentColumns } from "./LotoEquipmentColumns";
import { LotoQueryStatus } from "./LotoQueryStatus";
import { LotoRegisterHeader } from "./LotoRegisterHeader";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS = LOTO_STATUS_FILTERS.map((filter) => ({
  value: filter.id,
  label: filter.label,
}));

/**
 * ModuleFilterBar hands back a bare string. Checking it against the options
 * this component supplied keeps an unexpected value out of the request, where
 * it would fail the API's status regex as a 400 rather than being ignored.
 */
function isStatusFilter(value: string): value is LotoEquipmentStatusFilterDto {
  return LOTO_STATUS_FILTERS.some((filter) => filter.id === value);
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

  // Two permissions, not one: an admin can grant authoring a new procedure
  // without granting edits to the procedures already in force. Each control
  // asks for the one its own endpoint enforces.
  //
  // A worker is authorized to perform procedures, not to write them, so
  // neither is drawn for them rather than being offered and refused.
  const { can } = useCapabilities();
  const canCreate = can("Loto.Create");
  const canEdit = can("Loto.Update");
  const canDelete = can("Loto.Delete");
  const dropMutation = useDropLotoEquipmentMutation();
  const [pendingDelete, setPendingDelete] = useState<LotoEquipmentItem | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<LotoEquipmentStatusFilterDto>("All");
  const [pageNumber, setPageNumber] = useState(DEFAULT_LOTO_PAGE_NUMBER);

  // Debounce search and rewind to page 1 once it settles — a stale page number
  // against a new term would land on an empty slice.
  //
  // Trimmed before it is stored, and skipped when nothing actually changed:
  // without the guard this armed on mount and moved the reader back to page 1
  // a beat after they had clicked page 2, and re-ran for whitespace edits that
  // produce the same query.
  useEffect(() => {
    // "EQ-7" is what the row shows; "7" is what is stored and searched.
    const trimmed = stripEquipmentPrefix(query);
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

  const equipmentQuery = useLotoEquipmentQuery(
    {
      pageNumber,
      pageSize: DEFAULT_LOTO_PAGE_SIZE,
      search: debouncedQuery,
      status,
    },
    hasToken === true,
  );

  const columns = useMemo(() => {
    const base = buildLotoEquipmentColumns({
      onView: (item) => {
        router.push(lotoEquipmentDetailRoute(item.id));
      },
      // Passing no handler is what removes the control — the API enforces
      // Loto.Delete either way, this only avoids offering a refused action.
      onDelete: canDelete ? (item) => setPendingDelete(item) : undefined,
    });

    // The cog opens the procedure editor, so without the permission it leads
    // somewhere the reader cannot use. View stays: a worker still needs to
    // read the procedure for a machine they are authorized on.
    return canEdit
      ? withRowLink<LotoEquipmentItem>(base, {
          getHref: (item) => lotoEquipmentDetailRoute(item.id),
          getAriaLabel: (item) =>
            `Open equipment ${item.equipmentCode} — ${item.name}`,
        })
      : base;
  }, [router, canEdit, canDelete]);

  const confirmDelete = () => {
    if (!pendingDelete) return;

    dropMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(
          "Equipment deleted",
          `${pendingDelete.equipmentCode} — ${pendingDelete.name} removed from the register.`,
        );
        setPendingDelete(null);
      },
      onError: (error) => {
        // The API refuses this while a lockout is still on the machine, and
        // that sentence is the useful one — it says what to do first.
        toast.error(
          getMutationErrorMessage(error, "Failed to delete the equipment."),
        );
        setPendingDelete(null);
      },
    });
  };

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
              if (!isStatusFilter(value)) return;
              setStatus(value);
              setPageNumber(DEFAULT_LOTO_PAGE_NUMBER);
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
              actionLabel={
                onCreateProcedure && canCreate ? "Create Procedure" : undefined
              }
              actionIcon="mdi:file-document-outline"
              onAction={canCreate ? onCreateProcedure : undefined}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this equipment?"
        description={
          pendingDelete
            ? `${pendingDelete.equipmentCode} — ${pendingDelete.name} and its energy control procedure will be removed from the register. Its lockout history is kept.`
            : undefined
        }
        confirmLabel="Delete"
        isConfirming={dropMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
