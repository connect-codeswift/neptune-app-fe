"use client";

import { useMemo, type ComponentType } from "react";
import { Icon } from "@iconify/react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/incidents/list/IncidentBadge";
import {
  IncidentListTable,
  type IncidentListTableProps,
} from "@/components/incidents/list/IncidentListTable";
import { PolicyMakerRowActionsMenu } from "@/components/policy-maker/PolicyMakerRowActionsMenu";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";
import type {
  DocumentStatus,
  PolicyDocument,
} from "@/components/policy-maker/policy-maker-types";

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
  /** Table shell from incidents — defaults to IncidentListTable. */
  ListTable?: ComponentType<IncidentListTableProps<PolicyDocument>>;
  className?: string;
}>;

const columnHelper = createColumnHelper<PolicyDocument>();

function statusTone(status: DocumentStatus): IncidentBadgeTone {
  if (status === "In review") {
    return "teal";
  }
  if (status === "Expiring soon") {
    return "warn";
  }
  return "muted";
}

function StatusBadge(props: Readonly<{ status: DocumentStatus }>) {
  const { status } = props;
  return <IncidentBadge label={status} tone={statusTone(status)} />;
}

function createDocumentColumns(
  onEditDocument?: (document: PolicyDocument) => void,
): ColumnDef<PolicyDocument, unknown>[] {
  return [
    columnHelper.display({
      id: "document",
      header: "Document",
      size: 220,
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
              <Text
                as="p"
                className="text-[12px] leading-normal text-[#0b1320]"
              >
                {doc.title}
              </Text>
              <Text as="p" className="text-[10px] text-[#8892a3]">
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
      minSize: 48,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text as="span" className="text-[10px] font-bold text-[#0b1320]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("owner", {
      header: "Owner",
      size: 90,
      minSize: 70,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text as="span" className="text-[12px] text-[#566072]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      minSize: 100,
      meta: { align: "left" as const },
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("expires", {
      header: "Expires",
      size: 100,
      minSize: 80,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text as="span" className="text-[12px] text-[#566072]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 48,
      minSize: 44,
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
    ListTable = IncidentListTable,
    className = "",
  } = props;

  const columns = useMemo(
    () => createDocumentColumns(onEditDocument),
    [onEditDocument],
  );

  const toolbar = (
    <div className="flex h-[50.6px] items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] px-[15.57px]">
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="p" className="text-[12px] font-bold text-[#0b1320]">
          {categoryLabel}
        </Text>
        <Text as="p" className="text-[10px] text-[#8892a3]">
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
  );

  return (
    <ListTable
      data={documents}
      columns={columns}
      selectedId={selectedId}
      onSelect={onSelect}
      onOpenDetail={onOpenDetail}
      toolbar={toolbar}
      compact
      className={className}
    />
  );
}
