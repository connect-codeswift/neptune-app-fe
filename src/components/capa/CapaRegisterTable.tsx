"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { withManageAction } from "@/components/ui/table-manage-column";
import { createCapaColumns } from "@/components/capa/CapaColumns";
import { CapaRegisterHeader } from "@/components/capa/CapaRegisterHeader";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";

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
      withManageAction(
        createCapaColumns({
          selectedId,
          onViewMore: onToggleDetail,
          expanded,
        }),
        {
          getHref: (row) => `/dashboard/capa/${encodeURIComponent(row.id)}`,
          getAriaLabel: (row) => `Manage CAPA ${row.title}`,
        },
      ),
    [selectedId, onToggleDetail, expanded],
  );

  return (
    <Table
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
