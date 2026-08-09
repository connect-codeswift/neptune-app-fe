"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { Table } from "@/components/ui/Table";
import type {
  PpeCatalogDetail,
  PpeCatalogStatus,
  PpeIssuanceRecord,
} from "@/app/dashboard/ppe-management/ppe-data";
import { PpeCatalogDetailHeader } from "./PpeCatalogDetailHeader";
import { ppeIssuanceColumns } from "./PpeIssuanceColumns";

const PPE_ROUTE = "/dashboard/ppe-management";
const ISSUE_ROUTE = "/dashboard/ppe-management/issue";
const PROFILE_ROUTE = "/dashboard/ppe-management/profile";

const statusTone: Record<PpeCatalogStatus, "muted" | "warn" | "danger"> = {
  "In Stock": "muted",
  "Low Stock": "warn",
  "Out of Stock": "danger",
};

function MetaTile(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;
  return (
    <div className="flex flex-col gap-1 rounded-[10px] bg-[rgba(15,23,42,0.04)] px-3 py-2.5">
      <span className="text-sm font-semibold tracking-[0.6px] text-[#b3bbc8] uppercase">
        {label}
      </span>
      <span className="text-ehs-darker text-base font-semibold">{value}</span>
    </div>
  );
}

function MetaPair(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-ehs-muted-text text-[10px] font-bold uppercase">
        {label}
      </span>
      <span className="text-ehs-darker text-sm font-medium">{value}</span>
    </div>
  );
}

function InventoryStat(
  props: Readonly<{ value: number; label: string; muted?: boolean }>,
) {
  const { value, label, muted } = props;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[rgba(11,19,32,0.05)] bg-[#f8fafc] p-3 md:items-center md:gap-0.5 md:rounded-[10px] md:border-0 md:bg-[rgba(15,23,42,0.04)] md:px-2.5 md:py-2.5">
      <span
        className={[
          "text-2xl font-extrabold tabular-nums md:text-center md:text-lg",
          muted ? "text-ehs-muted-text" : "text-ehs-darker",
        ].join(" ")}
      >
        {value.toLocaleString("en-US")}
      </span>
      <span className="text-ehs-muted-text text-base font-semibold md:text-center md:font-normal">
        {label}
      </span>
    </div>
  );
}

function IssuanceMobileCard(
  props: Readonly<{
    record: PpeIssuanceRecord;
    onClick: () => void;
  }>,
) {
  const { record, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-[0px_4px_6px_rgba(15,23,42,0.02)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ehs-darker text-sm font-bold">
            {record.employee}
          </span>
          <span className="text-xs font-medium text-[#8892a3]">
            {`Issued: ${record.issueDate}`}
          </span>
        </div>
        <IncidentBadge
          label={record.status}
          tone="muted"
          className="shrink-0 rounded-md px-2 py-1 text-[11px]! font-bold uppercase"
        />
      </div>
      <div className="h-px w-full bg-[rgba(11,19,32,0.08)]" />
      <div className="flex gap-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-[#8892a3] uppercase">
            Quantity
          </span>
          <span className="text-ehs-darker text-[13px] font-semibold tabular-nums">
            {String(record.quantity)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-[#8892a3] uppercase">
            Size
          </span>
          <span className="text-ehs-darker text-[13px] font-semibold">
            {record.size}
          </span>
        </div>
      </div>
    </button>
  );
}

export type PpeCatalogDetailContentProps = Readonly<{
  item: PpeCatalogDetail;
}>;

export function PpeCatalogDetailContent(
  props: Readonly<PpeCatalogDetailContentProps>,
) {
  const { item } = props;
  const router = useRouter();
  const issuedCount = item.issuances.length;

  const openProfile = (issueId: string) => {
    if (!issueId.trim()) return;
    router.push(`${PROFILE_ROUTE}/${encodeURIComponent(issueId)}`);
  };

  const inventoryCard = (
    <IncidentGlassCard
      paddingClassName="p-4 md:p-[18px]"
      className="min-w-0 self-start"
    >
      <div className="flex flex-col gap-4 md:gap-3.5">
        <Text
          as="h3"
          className="text-ehs-darker text-[15px] font-extrabold md:text-base md:font-bold"
        >
          Inventory
        </Text>
        <div className="grid grid-cols-2 gap-3 md:gap-2.5">
          <InventoryStat value={item.inStock} label="In Stock" />
          <InventoryStat value={item.minLevel} label="Min Level" />
          <InventoryStat
            value={item.currentlyIssued}
            label="Currently Issued"
          />
          <InventoryStat
            value={item.onOrder}
            label="On Order"
            muted={item.onOrder === 0}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <PpeCatalogDetailHeader
        name={item.name}
        protectionType={item.protectionType}
      />

      <Button
        type="button"
        variant="primary"
        onClick={() => {
          router.push(
            `${ISSUE_ROUTE}?ppeItemId=${encodeURIComponent(item.id)}`,
          );
        }}
        className="flex w-full gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold shadow-[0px_4px_6px_rgba(8,145,166,0.17)] md:hidden"
      >
        <Icon icon="mdi:plus" className="size-[18px] shrink-0" />
        Issue This Item
      </Button>

      <div className="grid min-w-0 gap-3.5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard paddingClassName="p-4 md:p-4" className="min-w-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Text
                    as="h2"
                    className="text-ehs-darker text-base font-extrabold md:text-lg"
                  >
                    {item.name}
                  </Text>
                  <p className="text-ehs-muted-text text-xs font-semibold md:text-sm md:font-normal">
                    <span className="md:hidden">{`SKU · ${item.standard}`}</span>
                    <span className="hidden md:inline">{`${item.standard} · ${item.supplier}`}</span>
                  </p>
                </div>
                <IncidentBadge
                  label={item.status}
                  tone={statusTone[item.status]}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px]! font-bold uppercase md:rounded-full md:px-2.5 md:py-0.5 md:text-sm! md:font-semibold md:normal-case"
                />
              </div>

              <p className="text-ehs-muted-text text-[13px] leading-normal md:rounded-xl md:bg-[rgba(15,23,42,0.03)] md:px-3.5 md:py-3.5 md:text-base md:leading-5.5 md:text-[#2a3446]">
                {item.description}
              </p>

              {/* Mobile — 2-col pairs */}
              <div className="flex flex-col gap-3 md:hidden">
                <div className="flex gap-4">
                  <MetaPair label="Category" value={item.category} />
                  <MetaPair label="Supplier" value={item.supplier} />
                </div>
                <div className="flex gap-4">
                  <MetaPair label="Unit Cost" value={item.unitCost} />
                  <MetaPair label="Replace After" value={item.replaceAfter} />
                </div>
                <div className="flex gap-4">
                  <MetaPair
                    label="Inspection Interval"
                    value={item.inspectionInterval}
                  />
                  <MetaPair
                    label="Available Sizes"
                    value={item.availableSizes}
                  />
                </div>
              </div>

              {/* Desktop — tiles */}
              <div className="hidden grid-cols-1 gap-2.5 sm:grid-cols-3 md:grid">
                <MetaTile label="Category" value={item.category} />
                <MetaTile label="Supplier" value={item.supplier} />
                <MetaTile label="Unit Cost" value={item.unitCost} />
                <MetaTile label="Replace After" value={item.replaceAfter} />
                <MetaTile
                  label="Inspection Interval"
                  value={item.inspectionInterval}
                />
                <MetaTile label="Available Sizes" value={item.availableSizes} />
              </div>
            </div>
          </IncidentGlassCard>

          <div className="lg:hidden">{inventoryCard}</div>

          {/* Mobile — issuance cards */}
          <div className="flex flex-col gap-2 md:hidden">
            <Text
              as="h3"
              className="text-ehs-muted-text text-sm font-extrabold"
            >
              {`Currently Issued (${String(issuedCount)})`}
            </Text>
            {issuedCount === 0 ? (
              <p className="text-ehs-muted-text text-sm">
                No active issuances.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {item.issuances.map((record) => (
                  <li key={record.id}>
                    <IssuanceMobileCard
                      record={record}
                      onClick={() => {
                        openProfile(record.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop — issuance table */}
          <div className="hidden min-w-0 md:block">
            <Table
              data={item.issuances}
              columns={ppeIssuanceColumns}
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                openProfile(row.id);
              }}
              containerClassName="min-w-0"
              header={
                <Text as="h3" className="text-ehs-darker text-base font-bold">
                  {`Currently Issued (${String(issuedCount)})`}
                </Text>
              }
            />
          </div>
        </div>

        <div className="hidden lg:block">{inventoryCard}</div>
      </div>
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
      <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
        <Text as="p" className="text-ehs-darker text-sm font-semibold">
          PPE item not found
        </Text>
        <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
          {`No catalog entry matches “${itemId}”.`}
        </Text>
        <Link
          href={PPE_ROUTE}
          className="text-ehs-normal-blue mt-4 inline-flex text-sm font-semibold"
        >
          Back to PPE Management
        </Link>
      </IncidentGlassCard>
    </div>
  );
}
