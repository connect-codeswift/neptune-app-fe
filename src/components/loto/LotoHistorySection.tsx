"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { LOTO_HISTORY } from "@/app/dashboard/lockout-tagout/loto-data";
import { toast } from "@/lib/toast";
import { buildLotoHistoryColumns } from "./LotoHistoryColumns";

/** Lockout history table — Figma 6888:49236. */
export function LotoHistorySection() {
  const columns = useMemo(
    () =>
      buildLotoHistoryColumns({
        onLogClick: (item) => {
          toast.info(`Open ${item.logId}`);
        },
      }),
    [],
  );

  return (
    <Table
      data={LOTO_HISTORY}
      columns={columns}
      getRowId={(row) => row.id}
      containerClassName="min-w-0"
      header={
        <p className="text-ehs-darker py-1 text-base font-bold">
          All Lockout Records ({String(LOTO_HISTORY.length)})
        </p>
      }
    />
  );
}
