"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { Table } from "@/components/ui/Table";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import type {
  PpeCatalogDetail,
  PpeCatalogStatus,
  PpeIssuanceRecord,
} from "@/app/dashboard/ppe-management/ppe-data";
import { PpeCatalogDetailHeader } from "./PpeCatalogDetailHeader";
import { makePpeIssuanceColumns } from "./PpeIssuanceColumns";
import { PpeIssuanceDetailModal } from "./PpeIssuanceDetailModal";

const PPE_ROUTE = "/dashboard/ppe-management";

const statusTone: Record<PpeCatalogStatus, "muted" | "warn" | "danger"> = {
  "In Stock": "muted",
  "Low Stock": "warn",
  "Out of Stock": "danger",
};

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker truncate" title={value}>
        {value}
      </Text>
    </div>
  );
}

function InventoryStat(
  props: Readonly<{
    value: number;
    label: string;
    muted?: boolean;
    emphasize?: boolean;
  }>,
) {
  const { value, label, muted, emphasize } = props;

  return (
    <div
      className={[
        "rounded-2.5 flex flex-col gap-0.5 px-2.5 py-2",
        emphasize
          ? "bg-ehs-yellow/15 ring-ehs-yellow/30 ring-1"
          : "bg-ehs-surface-inverse/4",
      ].join(" ")}
    >
      <Text
        as="span"
        className={[
          "text2",
          muted
            ? "text-ehs-muted-text"
            : emphasize
              ? "text-ehs-yellow"
              : "text-ehs-darker",
        ].join(" ")}
      >
        {value.toLocaleString("en-US")}
      </Text>
      <Text as="span" className="text8 text-ehs-muted-text">
        {label}
      </Text>
    </div>
  );
}

function stockLevelPercent(item: PpeCatalogDetail): number {
  const capacity = item.inStock + item.currentlyIssued;
  if (capacity <= 0) {
    return 0;
  }
  return Math.round((item.inStock / capacity) * 100);
}

function stockTone(percent: number): "good" | "warn" | "danger" {
  if (percent < 50) return "danger";
  if (percent < 75) return "warn";
  return "good";
}

const progressClassName: Record<"good" | "warn" | "danger", string> = {
  good: "bg-ehs-green",
  warn: "bg-ehs-yellow",
  danger: "bg-ehs-red",
};

function IssuanceMobileCard(
  props: Readonly<{
    record: PpeIssuanceRecord;
    onOpen: (record: PpeIssuanceRecord) => void;
  }>,
) {
  const { record, onOpen } = props;
  const description = record.description?.trim();

  return (
    <button
      type="button"
      onClick={() => onOpen(record)}
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-3 rounded-2xl border bg-ehs-surface/80 p-3.5 text-left shadow-[0px_4px_6px_rgba(15,23,42,0.02)] transition-colors hover:bg-ehs-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="span" className="text4 text-ehs-darker">
            {record.employee}
          </Text>
          <Text as="span" className="text8 text-ehs-muted-text">
            {`Issued: ${record.issueDate}`}
          </Text>
        </div>
        <IncidentBadge
          label={record.status}
          tone="muted"
          className="shrink-0"
        />
      </div>
      {description ? (
        <Text as="p" className="text4 text-ehs-slate line-clamp-2">
          {description}
        </Text>
      ) : null}
      <div className="h-px w-full bg-ehs-surface-inverse/8" />
      <div className="flex gap-8">
        <div className="flex flex-col gap-0.5">
          <Text as="span" className="text9 text-ehs-muted-text">
            Quantity
          </Text>
          <Text as="span" className="text4 text-ehs-darker tabular-nums">
            {String(record.quantity)}
          </Text>
        </div>
        <div className="flex flex-col gap-0.5">
          <Text as="span" className="text9 text-ehs-muted-text">
            Size
          </Text>
          <Text as="span" className="text4 text-ehs-darker">
            {record.size}
          </Text>
        </div>
      </div>
    </button>
  );
}

function CatalogIssuanceTableHeader(
  props: Readonly<{
    count: number;
  }>,
) {
  const { count } = props;

  return (
    <div className="flex h-[51px] flex-wrap items-center justify-between gap-3">
      <Text as="h2" className="text3 text-ehs-darker shrink-0">
        {`Currently issued (${String(count)})`}
      </Text>
    </div>
  );
}

export type PpeCatalogDetailContentProps = Readonly<{
  item: PpeCatalogDetail;
}>;

/**
 * Catalog detail — Hazard-dashboard layout:
 * two equal insight cards on top, full-width issuance table below.
 */
export function PpeCatalogDetailContent(
  props: Readonly<PpeCatalogDetailContentProps>,
) {
  const { item } = props;
  const [selectedIssuance, setSelectedIssuance] =
    useState<PpeIssuanceRecord | null>(null);
  const issuedCount = item.issuances.length;
  const stockPercent = stockLevelPercent(item);
  const tone = stockTone(stockPercent);
  const belowMin = item.inStock <= item.minLevel;

  const openIssuance = useCallback((record: PpeIssuanceRecord) => {
    setSelectedIssuance(record);
  }, []);

  const closeIssuance = useCallback(() => {
    setSelectedIssuance(null);
  }, []);

  const toggleIssuance = useCallback((record: PpeIssuanceRecord) => {
    setSelectedIssuance((current) =>
      current?.id === record.id ? null : record,
    );
  }, []);

  const issuanceColumns = useMemo(
    () =>
      makePpeIssuanceColumns({
        selectedId: selectedIssuance?.id ?? null,
        onView: toggleIssuance,
      }),
    [selectedIssuance?.id, toggleIssuance],
  );

  const issuanceTableHeader = (
    <CatalogIssuanceTableHeader count={issuedCount} />
  );

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <PpeCatalogDetailHeader
        name={item.name}
        protectionType={item.protectionType}
      />

      {belowMin || item.status === "Low Stock" ? (
        <div className="bg-ehs-yellow/12 text-ehs-darker flex items-start gap-2.5 rounded-xl px-3.5 py-2.5">
          <Icon
            icon="mdi:alert-outline"
            className="text-ehs-yellow mt-0.5 size-4.5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <Text as="p" className="text5">
              Stock is at or below the minimum level
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text mt-0.5">
              {`${item.inStock.toLocaleString("en-US")} on hand · minimum ${item.minLevel.toLocaleString("en-US")}`}
            </Text>
          </div>
        </div>
      ) : null}

      {/* Upper cards — equal height, compact insight strip */}
      <div className="grid min-w-0 items-stretch gap-3.5 lg:grid-cols-2">
        <IncidentGlassCard
          paddingClassName="p-3.5"
          className="min-w-0"
          incidentGlassCardClassName="h-full"
        >
          <header className="mb-2.5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text as="h3" className="text3 text-ehs-dark-bg">
                Item details
              </Text>
              <Text as="p" className="text4 text-ehs-muted-text truncate">
                {item.standard}
              </Text>
            </div>
            <IncidentBadge
              label={item.status}
              tone={statusTone[item.status]}
              className="shrink-0"
            />
          </header>

          {item.description.trim() &&
          item.description !== "No description provided." ? (
            <Text as="p" className="text4 text-ehs-slate mb-2.5 line-clamp-3">
              {item.description}
            </Text>
          ) : null}

          <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            <MetaField label="Category" value={item.category} />
            <MetaField label="Supplier" value={item.supplier} />
            <MetaField label="Unit cost" value={item.unitCost} />
            <MetaField label="Replace after" value={item.replaceAfter} />
            <MetaField label="Inspection" value={item.inspectionInterval} />
            <MetaField label="Sizes" value={item.availableSizes} />
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-3.5"
          className="min-w-0"
          incidentGlassCardClassName="h-full"
        >
          <header className="mb-2.5 flex flex-col gap-0.5">
            <Text as="h3" className="text3 text-ehs-dark-bg">
              Inventory
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text">
              Current stock position
            </Text>
          </header>

          <div className="mb-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Text as="p" className="text9 text-ehs-muted-text">
                Stock level
              </Text>
              <Text
                as="span"
                className={[
                  "text7",
                  tone === "danger"
                    ? "text-ehs-red"
                    : tone === "warn"
                      ? "text-ehs-yellow"
                      : "text-ehs-gray",
                ].join(" ")}
              >
                {`${String(stockPercent)}%`}
              </Text>
            </div>
            <div className="bg-ehs-muted-text/20 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full ${progressClassName[tone]}`}
                style={{ width: `${String(stockPercent)}%` }}
              />
            </div>
            <Text as="p" className="text8 text-ehs-muted-text mt-1.5">
              {`${item.inStock.toLocaleString("en-US")} on hand · ${item.currentlyIssued.toLocaleString("en-US")} issued`}
            </Text>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <InventoryStat
              value={item.inStock}
              label="In stock"
              emphasize={belowMin}
            />
            <InventoryStat value={item.minLevel} label="Min level" />
            <InventoryStat
              value={item.currentlyIssued}
              label="Currently issued"
            />
            <InventoryStat
              value={item.onOrder}
              label="On order"
              muted={item.onOrder === 0}
            />
          </div>
        </IncidentGlassCard>
      </div>

      {/* Full-width issuance list — same table chrome as PPE inventory */}
      <div className="flex w-full min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-3 md:hidden">
          {issuanceTableHeader}
          {issuedCount === 0 ? (
            <p className="text4 text-ehs-muted-text">
              No active issuances for this item yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {item.issuances.map((record) => (
                <li key={record.id}>
                  <IssuanceMobileCard record={record} onOpen={openIssuance} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden w-full min-w-0 overflow-x-auto md:block">
          <Table
            variant="compliance"
            data={item.issuances}
            columns={issuanceColumns}
            getRowId={(row) => row.id}
            selectedRowId={selectedIssuance?.id ?? null}
            containerClassName={complianceGlassCardClass}
            header={issuanceTableHeader}
          />
        </div>
      </div>

      <PpeIssuanceDetailModal
        open={selectedIssuance !== null}
        issueId={selectedIssuance?.id ?? null}
        onClose={closeIssuance}
      />
    </div>
  );
}

export type PpeCatalogNotFoundProps = Readonly<{
  itemId: string;
}>;

export function PpeCatalogNotFound(props: Readonly<PpeCatalogNotFoundProps>) {
  const { itemId } = props;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <PpeCatalogDetailHeader name="Not found" protectionType="Catalog" />
      <IncidentGlassCard
        paddingClassName="p-6"
        className="min-w-0"
        incidentGlassCardClassName="items-start"
      >
        <Text as="p" className="text4 text-ehs-darker">
          PPE item not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text mt-1">
          {`No catalog entry matches “${itemId}”.`}
        </Text>
        <Link
          href={PPE_ROUTE}
          className="text4 text-ehs-normal-blue mt-4 inline-flex"
        >
          Back to PPE Management
        </Link>
      </IncidentGlassCard>
    </div>
  );
}
