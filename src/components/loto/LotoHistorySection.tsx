"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { LOTO_HISTORY } from "@/app/dashboard/lockout-tagout/loto-data";
import { buildLotoHistoryColumns } from "./LotoHistoryColumns";

/** Lockout history table — Figma 6888:49236. */
export function LotoHistorySection() {
  const columns = useMemo(() => buildLotoHistoryColumns(), []);

  return (
    <Table
      data={LOTO_HISTORY}
      columns={columns}
      getRowId={(row) => row.id}
      containerClassName="min-w-0"
      variant="incident"
      header={
        <p className="text3 text-ehs-darker py-1">
          All Lockout Records ({String(LOTO_HISTORY.length)})
        </p>
      }
    />
  );
}
