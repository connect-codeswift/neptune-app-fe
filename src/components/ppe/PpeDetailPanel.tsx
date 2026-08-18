"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import type { PpeCatalogDetail } from "@/app/dashboard/ppe-management/ppe-data";

export type PpeDetailPanelProps = Readonly<{
  /** Mapped GET /api/ppe/{id} payload for the fields this card shows. */
  item: PpeCatalogDetail | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

function InventoryStat(props: Readonly<{ label: string; value: number }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker tabular-nums">
        {value.toLocaleString("en-US")}
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

const CATALOG_ROUTE = "/dashboard/ppe-management/catalog";

/**
 * Right-side preview card for PPE inventory — same shell as Policy Maker.
 *
 * Omits fields already visible in the list table (name/category, supplier,
 * on-hand) and surfaces detail-API context including stock level.
 */
export function PpeDetailPanel(props: Readonly<PpeDetailPanelProps>) {
  const {
    item,
    isLoading = false,
    errorMessage = null,
    onRetry,
    className = "",
  } = props;

  if (isLoading) {
    return (
      <IncidentGlassCard
        paddingClassName="p-[18px]"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-7 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          Loading item details…
        </Text>
      </IncidentGlassCard>
    );
  }

  if (errorMessage) {
    return (
      <IncidentGlassCard
        paddingClassName="p-[18px]"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-darker">
          Could not load details
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text text-center">
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            className="mt-1"
          >
            Retry
          </Button>
        ) : null}
      </IncidentGlassCard>
    );
  }

  if (!item) {
    return (
      <IncidentGlassCard
        paddingClassName="p-[18px]"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          Select an item to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  const stockPercent = stockLevelPercent(item);
  const tone = stockTone(stockPercent);

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-[18px] pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {item.standard}
          </Text>

          <Link
            href={`${CATALOG_ROUTE}/${encodeURIComponent(item.id)}`}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text4 inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {item.name}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-2">
          {`${item.status} · ${item.protectionType}`}
        </Text>
      </div>

      {item.description.trim() &&
      item.description !== "No description provided." ? (
        <div className="border-ehs-border border-b px-5 py-3.5">
          <Text as="p" className="text9 text-ehs-muted-text mb-2">
            Description
          </Text>
          <Text as="p" className="text4 text-ehs-slate line-clamp-4">
            {item.description}
          </Text>
        </div>
      ) : null}

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-3.5">
        <MetaField label="Unit cost" value={item.unitCost} />
        <MetaField label="Replace after" value={item.replaceAfter} />
        <MetaField label="Inspection" value={item.inspectionInterval} />
        <MetaField label="Sizes" value={item.availableSizes} />
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
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
        <Text as="p" className="text8 text-ehs-muted-text mt-2">
          {`${item.inStock.toLocaleString("en-US")} on hand · ${item.currentlyIssued.toLocaleString("en-US")} issued`}
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-3.5">
        <InventoryStat label="Min level" value={item.minLevel} />
        <InventoryStat label="On order" value={item.onOrder} />
        <InventoryStat label="Currently issued" value={item.currentlyIssued} />
      </div>
    </IncidentGlassCard>
  );
}
