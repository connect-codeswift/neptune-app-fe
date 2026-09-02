"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { withRowLink } from "@/components/ui/table-row-link";
import { createCapaColumns } from "@/components/capa/CapaColumns";
import { CapaRegisterHeader } from "@/components/capa/CapaRegisterHeader";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";

/** Where a row in this register opens. Shared by the id link and the row click. */
const capaRecordHref = (id: string) =>
  `/dashboard/capa/${encodeURIComponent(id)}`;

export type CapaRegisterTableProps = Readonly<{
  items: readonly CapaDashboardItem[];
  selectedId: string | null;
  onToggleDetail: (id: string) => void;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  isPaginationLoading?: boolean;
  expanded?: boolean;
  onNewCapa?: () => void;
}>;

/** CAPA register — same compliance table as Audits / Inspections. */
export function CapaRegisterTable(props: Readonly<CapaRegisterTableProps>) {
  const {
    items,
    selectedId,
    onToggleDetail,
    pageNumber,
    pageSize,
    totalCount,
    onPageChange,
    isPaginationLoading = false,
    expanded = true,
    onNewCapa,
  } = props;
  const columns = useMemo(
    () =>
      withRowLink(
        createCapaColumns({
          selectedId,
          onViewMore: onToggleDetail,
          expanded,
        }),
        {
          getHref: (row) => capaRecordHref(row.id),
          getAriaLabel: (row) => `Open CAPA ${row.title}`,
        },
      ),
    [selectedId, onToggleDetail, expanded],
  );

  return (
    <Table
      rowHref={(row) => capaRecordHref(row.id)}
      variant="compliance"
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      containerClassName={[complianceGlassCardClass, "min-w-0"].join(" ")}
      header={
        <CapaRegisterHeader capaCount={totalCount} onNewCapa={onNewCapa} />
      }
      pagination={{
        pageNumber,
        pageSize,
        totalRecords: totalCount,
        onPageChange,
        isLoading: isPaginationLoading,
      }}
    />
  );
}
