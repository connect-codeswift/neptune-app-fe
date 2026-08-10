"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import type { PpeInventoryItem } from "@/app/dashboard/ppe-management/ppe-data";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { usePpeItemsQuery } from "@/hooks/use-ppe-queries";
import { toPpeInventoryItems } from "@/lib/map-ppe";
import { PpeInventoryCard } from "./PpeInventoryCard";
import { ppeInventoryColumns } from "./PpeInventoryColumns";
import { PpeInventoryHeader } from "./PpeInventoryToolbar";
import {
  PpeInventoryCardsSkeleton,
  PpeSearchBarSkeleton,
  PpeTableSkeleton,
} from "./PpeSkeletons";

const ISSUE_ROUTE = "/dashboard/ppe-management/issue";
const CATALOG_ROUTE = "/dashboard/ppe-management/catalog";

type PpeCategoryFilter = "all" | string;

function itemCategory(item: PpeInventoryItem): string {
  return item.protectionType?.trim() || item.category.trim();
}

function matchesSearch(item: PpeInventoryItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    item.category.toLowerCase().includes(normalized) ||
    (item.protectionType?.toLowerCase().includes(normalized) ?? false) ||
    item.supplier.toLowerCase().includes(normalized)
  );
}

function matchesCategory(
  item: PpeInventoryItem,
  category: PpeCategoryFilter,
): boolean {
  if (category === "all") return true;
  return itemCategory(item) === category;
}

/** Short chip labels so the filter row stays on one line. */
function toShortCategoryLabel(category: string): string {
  const trimmed = category.trim();
  if (trimmed === "Eye & Face Protection") return "Eye & Face";
  if (trimmed.endsWith(" Protection")) {
    return trimmed.slice(0, -" Protection".length);
  }
  return trimmed;
}

function toCategoryFilterOptions(items: readonly PpeInventoryItem[]) {
  const unique = Array.from(
    new Set(items.map(itemCategory).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  return [
    { value: "all", label: "All" },
    ...unique.map((id) => ({
      value: id,
      label: toShortCategoryLabel(id),
    })),
  ] as const;
}

export function PpeInventorySection() {
  const router = useRouter();
  const ppeItemsQuery = usePpeItemsQuery();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PpeCategoryFilter>("all");

  const inventory = useMemo(
    () => toPpeInventoryItems(ppeItemsQuery.data ?? []),
    [ppeItemsQuery.data],
  );

  const categoryOptions = useMemo(
    () => toCategoryFilterOptions(inventory),
    [inventory],
  );

  const filtered = useMemo(
    () =>
      inventory.filter(
        (item) => matchesSearch(item, query) && matchesCategory(item, category),
      ),
    [inventory, query, category],
  );

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "item" : "items"
  }`;

  const openCatalog = (id: string) => {
    router.push(`${CATALOG_ROUTE}/${encodeURIComponent(id)}`);
  };

  const header = (
    <PpeInventoryHeader
      onIssuePpe={() => {
        router.push(ISSUE_ROUTE);
      }}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Category",
            options: [...categoryOptions],
            value: category,
            onChange: setCategory,
            disabled: ppeItemsQuery.isPending && !ppeItemsQuery.data,
          },
        ]}
      />

      {ppeItemsQuery.isPending && !ppeItemsQuery.data ? (
        <>
          <PpeSearchBarSkeleton />
          <PpeInventoryCardsSkeleton />
          <PpeTableSkeleton rows={7} columns={6} />
        </>
      ) : null}

      {ppeItemsQuery.isError ? (
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            ppeItemsQuery.error,
            "Could not load PPE inventory.",
          )}
        </Text>
      ) : null}

      {!ppeItemsQuery.isPending || ppeItemsQuery.data ? (
        <>
          <ModuleSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by category, supplier..."
            aria-label="Search PPE inventory"
            resultLabel={resultLabel}
          />

          {/* Mobile — progress cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {header}
            {filtered.length === 0 ? (
              <p className="text-ehs-muted-text text-sm">No items found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <PpeInventoryCard
                      item={item}
                      onClick={() => {
                        openCatalog(item.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop — table */}
          <div className="hidden min-w-0 overflow-x-auto md:block">
            <Table
              data={filtered}
              columns={ppeInventoryColumns}
              getRowId={(row) => row.id}
              getRowClassName={(row) =>
                row.attention ? "bg-[rgba(239,68,68,0.06)]" : undefined
              }
              onRowClick={(row) => {
                openCatalog(row.id);
              }}
              containerClassName="min-w-0"
              header={header}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
