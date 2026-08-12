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
  /** Toggle the right-side preview panel (same behavior as Incident List). */
  onViewMore: (id: string) => void;
  onUploadDocument?: () => void;
  /** When true (detail panel closed), columns use the wider layout. */
  expanded?: boolean;
  pagination?: TablePagination;
  className?: string;
}>;

const columnHelper = createColumnHelper<PolicyDocument>();

function createDocumentColumns(
  expanded: boolean,
  options: Readonly<{
    selectedId: string | null;
    onViewMore: (id: string) => void;
  }>,
): ColumnDef<PolicyDocument, unknown>[] {
  const { selectedId, onViewMore } = options;

  return [
    columnHelper.display({
      id: "document",
      header: "Document",
      size: expanded ? 320 : 220,
      minSize: 160,
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
              <Text as="p" className="text-xs leading-normal text-[#0b1320]">
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
      size: expanded ? 72 : 54,
      minSize: 48,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
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
      size: expanded ? 140 : 90,
      minSize: 72,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <Text as="span" className="text-xs leading-normal text-[#566072]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: expanded ? 160 : 130,
      minSize: 100,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => <CompliancePill label={info.getValue()} />,
    }),
    columnHelper.accessor("expires", {
      header: "Expires",
      size: expanded ? 130 : 100,
      minSize: 84,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
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
      id: "view",
      header: "",
      size: 56,
      minSize: 48,
      meta: { align: "center" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for ${row.original.title}`
                : `View ${row.original.title}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onViewMore(row.original.id);
            }}
          >
            <Icon
              icon={
                isOpen
                  ? "icon-park-outline:preview-close-one"
                  : "lets-icons:view"
              }
              className="size-5"
              aria-hidden="true"
            />
          </button>
        );
      },
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
    onViewMore,
    onUploadDocument,
    expanded = false,
    pagination,
    className = "",
  } = props;

  const columns = useMemo(
    () => createDocumentColumns(expanded, { selectedId, onViewMore }),
    [expanded, selectedId, onViewMore],
  );

  return (
    <Table
      variant="compliance"
      data={documents}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      onRowClick={(row) => {
        onViewMore(row.id);
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
