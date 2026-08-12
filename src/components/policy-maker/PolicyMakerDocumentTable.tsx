"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table, type TablePagination } from "@/components/ui/Table";
import {
  CompliancePill,
  complianceGlassCardClass,
} from "@/components/regulatory-compliance/compliance-ui";
import { PolicyMakerRowActionsMenu } from "@/components/policy-maker/PolicyMakerRowActionsMenu";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerDocumentTableProps = Readonly<{
  categoryLabel: string;
  documentCount: number;
  documents: readonly PolicyDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEditDocument?: (document: PolicyDocument) => void;
  onUploadDocument?: () => void;
  /** Second click on selected row — opens full document detail. */
  onOpenDetail?: (id: string) => void;
  pagination?: TablePagination;
  className?: string;
}>;

const columnHelper = createColumnHelper<PolicyDocument>();

function createDocumentColumns(
  onEditDocument?: (document: PolicyDocument) => void,
): ColumnDef<PolicyDocument, unknown>[] {
  return [
    columnHelper.display({
      id: "document",
      header: "Document",
      size: 220,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-[9.73px]">
            <div className="flex size-[29.19px] shrink-0 items-center justify-center rounded-[3.89px] border-[0.97px] border-[rgba(15,23,42,0.08)] bg-gradient-to-b from-[rgba(255,255,255,0.82)] to-[rgba(255,255,255,0.62)]">
              <Icon
                icon="mdi:file-document-outline"
                className="size-3.5 text-[#566072]"
                aria-hidden="true"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <Text
                as="p"
                className="text-xs leading-normal text-[#0b1320]"
              >
                {doc.title}
              </Text>
              <Text as="p" className="text-2.5 text-[#8892a3]">
                {`${doc.code} · ${doc.site}`}
              </Text>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("version", {
      header: "Ver",
      size: 54,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text
          as="span"
          className="text-2.5 leading-normal font-bold text-[#8892a3]"
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("owner", {
      header: "Owner",
      size: 90,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text as="span" className="text-xs leading-normal text-[#566072]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      meta: { align: "left" as const },
      cell: (info) => <CompliancePill label={info.getValue()} />,
    }),
    columnHelper.accessor("expires", {
      header: "Expires",
      size: 100,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text
          as="span"
          className="text-xs leading-normal whitespace-nowrap tabular-nums text-[#566072]"
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 48,
      meta: { align: "center" as const },
      cell: ({ row }) => (
        <PolicyMakerRowActionsMenu
          documentTitle={row.original.title}
          onEditDocument={() => onEditDocument?.(row.original)}
        />
      ),
    }),
  ] as ColumnDef<PolicyDocument, unknown>[];
}

export function PolicyMakerDocumentTable(
  props: Readonly<PolicyMakerDocumentTableProps>,
) {
  const {
    categoryLabel,
    documentCount,
    documents,
    selectedId,
    onSelect,
    onEditDocument,
    onUploadDocument,
    onOpenDetail,
    pagination,
    className = "",
  } = props;

  const columns = useMemo(
    () => createDocumentColumns(onEditDocument),
    [onEditDocument],
  );

  return (
    <Table
      variant="compliance"
      data={documents}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      onRowClick={(row) => {
        if (selectedId === row.id && onOpenDetail) {
          onOpenDetail(row.id);
          return;
        }
        onSelect(row.id);
      }}
      pagination={pagination}
      containerClassName={[complianceGlassCardClass, className]
        .filter(Boolean)
        .join(" ")}
      header={
        <div className="flex h-[50.595px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <Text
              as="h2"
              className="shrink-0 text-xs leading-none font-bold text-[#0b1320]"
            >
              {categoryLabel}
            </Text>
            <Text as="p" className="text-2.5 leading-none text-[#8892a3]">
              {`${String(documentCount)} documents`}
            </Text>
          </div>

          {onUploadDocument ? (
            <Button
              type="button"
              variant="primary"
              onClick={onUploadDocument}
              className={TABLE_HEADER_ACTION_CLASS}
            >
              <Icon
                icon="mdi:plus"
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden="true"
              />
              <span className="sm:hidden">Upload</span>
              <span className="hidden sm:inline">Upload a Document</span>
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
