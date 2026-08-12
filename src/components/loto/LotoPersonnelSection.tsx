"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { LOTO_PERSONNEL } from "@/app/dashboard/lockout-tagout/loto-data";
import { toast } from "@/lib/toast";
import { buildLotoPersonnelColumns } from "./LotoPersonnelColumns";

/** Authorized personnel table — Figma 6888:49696. */
export function LotoPersonnelSection() {
  const columns = useMemo(
    () =>
      buildLotoPersonnelColumns({
        onEdit: (item) => {
          toast.info(`Edit ${item.name}`);
        },
        onRenew: (item) => {
          toast.success(`Renew certification for ${item.name}`);
        },
      }),
    [],
  );

  return (
    <Table
      data={LOTO_PERSONNEL}
      columns={columns}
      getRowId={(row) => row.id}
      containerClassName="min-w-0"
      variant="incident"
    />
  );
}
