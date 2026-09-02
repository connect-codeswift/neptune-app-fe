"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table, type TablePagination } from "@/components/ui/Table";
import { withRowLink } from "@/components/ui/table-row-link";
import {
  CompliancePill,
  complianceGlassCardClass,
} from "@/components/regulatory-compliance/compliance-ui";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { formatDocumentDisplayId } from "@/services/mappers/document-list.mapper";

/** Where a row in this register opens. Shared by the id link and the row click. */
const policyDocumentHref = (id: string) =>
  `/dashboard/policy-maker/${encodeURIComponent(id)}`;

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

function documentSubtitle(doc: PolicyDocument): string {
  const displayId = formatDocumentDisplayId(doc.id);
  const code = doc.code.trim();
  const parts: string[] = [];
  if (
    code !== "" &&
    code !== "—" &&
    code.toUpperCase() !== displayId.toUpperCase()
  ) {
    parts.push(code);
  }
  if (doc.site.trim() !== "") {
    parts.push(doc.site);
  }
  return parts.join(" · ");
}

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
      id: "displayId",
      header: "ID",
      size: 108,
      minSize: 96,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const displayId = formatDocumentDisplayId(row.original.id);
        return (
          <Text
            as="span"
            className="text7 text-ehs-muted-text whitespace-nowrap"
            title={displayId}
          >
            {displayId}
          </Text>
        );
      },
    }),
    columnHelper.display({
      id: "document",
      header: "Document",
      size: expanded ? 320 : 220,
      minSize: 160,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="border-ehs-border-ink/8 from-ehs-surface/82 to-ehs-surface/62 flex size-7 shrink-0 items-center justify-center rounded border bg-linear-to-b">
              <Icon
                icon="mdi:file-document-outline"
                className="text-ehs-gray size-3.5"
                aria-hidden="true"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <Text as="p" className="text4 text-ehs-darker">
                {doc.title}
              </Text>
              <Text as="p" className="text8 text-ehs-muted-text">
                {documentSubtitle(doc)}
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
        <Text as="span" className="text7 text-ehs-muted-text">
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
        <Text as="span" className="text4 text-ehs-gray">
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
        <Text as="span" className="text4 text-ehs-gray whitespace-nowrap">
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
    () =>
      withRowLink(createDocumentColumns(expanded, { selectedId, onViewMore }), {
        getHref: (row) => policyDocumentHref(row.id),
        getAriaLabel: (row) => `Open document ${row.title}`,
      }),
    [expanded, selectedId, onViewMore],
  );

  return (
    <Table
      rowHref={(row) => policyDocumentHref(row.id)}
      variant="compliance"
      data={documents}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      pagination={pagination}
      containerClassName={[complianceGlassCardClass, className]
        .filter(Boolean)
        .join(" ")}
      header={
        <div className="flex h-12.5 items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <Text as="h2" className="text3 text-ehs-darker shrink-0">
              {categoryLabel}
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text">
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
