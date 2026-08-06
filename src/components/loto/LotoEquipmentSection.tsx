"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import {
  LOTO_EQUIPMENT,
  type LotoEquipmentItem,
  type LotoStatusFilter,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoApplyLockoutRoute } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { lotoProcedureEditRoute } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { buildLotoEquipmentColumns } from "./LotoEquipmentColumns";
import { LotoEquipmentToolbar } from "./LotoEquipmentToolbar";

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
        onEdit: (item) => {
          router.push(lotoProcedureEditRoute(item.id));
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
      <LotoEquipmentToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        resultLabel={resultLabel}
      />

      <Table
        data={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        containerClassName="min-w-0"
      />
    </div>
  );
}
