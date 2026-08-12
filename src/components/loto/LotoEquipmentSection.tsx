"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  LOTO_EQUIPMENT,
  LOTO_STATUS_FILTERS,
  type LotoEquipmentItem,
  type LotoStatusFilter,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoApplyLockoutRoute } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { buildLotoEquipmentColumns } from "./LotoEquipmentColumns";

function matchesSearch(item: LotoEquipmentItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    item.name.toLowerCase().includes(needle) ||
    item.type.toLowerCase().includes(needle) ||
    item.location.toLowerCase().includes(needle) ||
    item.procedureId.toLowerCase().includes(needle) ||
    item.energySources.some((source) => source.toLowerCase().includes(needle))
  );
}

function matchesStatus(
  item: LotoEquipmentItem,
  status: LotoStatusFilter,
): boolean {
  if (status === "all") return true;
  return item.status === status;
}

const STATUS_OPTIONS = LOTO_STATUS_FILTERS.map((filter) => ({
  value: filter.id,
  label: filter.label,
}));

export function LotoEquipmentSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LotoStatusFilter>("all");

  const filtered = useMemo(
    () =>
      LOTO_EQUIPMENT.filter(
        (item) => matchesSearch(item, query) && matchesStatus(item, status),
      ),
    [query, status],
  );

  const columns = useMemo(
    () =>
      buildLotoEquipmentColumns({
        onView: (item) => {
          router.push(lotoEquipmentDetailRoute(item.id));
        },
        onLock: (item) => {
          router.push(lotoApplyLockoutRoute(item.id));
        },
      }),
    [router],
  );

  const resultLabel = `${String(filtered.length)} of ${String(LOTO_EQUIPMENT.length)}`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Status",
            options: STATUS_OPTIONS,
            value: status,
            onChange: (value) => {
              setStatus(value as LotoStatusFilter);
            },
          },
        ]}
      />

      <ModuleSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search equipment..."
        aria-label="Search equipment"
        resultLabel={resultLabel}
      />

      <Table
        data={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        containerClassName="min-w-0"
        variant="incident"
      />
    </div>
  );
}
