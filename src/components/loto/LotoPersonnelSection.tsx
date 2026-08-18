"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoPersonnelQuery } from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { buildLotoPersonnelColumns } from "./LotoPersonnelColumns";
import { LotoQueryStatus } from "./LotoQueryStatus";

/** Authorized personnel table — GET /api/Loto/personnel. Figma 6888:49696. */
export function LotoPersonnelSection() {
  const hasToken = useHasAccessToken();
  const personnelQuery = useLotoPersonnelQuery(hasToken === true);
  const columns = useMemo(() => buildLotoPersonnelColumns(), []);

  if (hasToken === null || (hasToken && personnelQuery.isLoading)) {
    return <LotoQueryStatus state="loading" />;
  }

  if (hasToken === false) {
    return (
      <LotoQueryStatus
        state="error"
        message="Please sign in to load authorized personnel."
      />
    );
  }

  if (personnelQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          personnelQuery.error,
          "Failed to load authorized personnel.",
        )}
      />
    );
  }

  const personnel = personnelQuery.data ?? [];

  if (personnel.length === 0) {
    return (
      <LotoQueryStatus
        state="empty"
        message="No one is authorized on any equipment at this site yet."
      />
    );
  }

  return (
    <Table
      data={personnel}
      columns={columns}
      getRowId={(row) => String(row.id)}
      containerClassName="min-w-0"
      variant="incident"
    />
  );
}
