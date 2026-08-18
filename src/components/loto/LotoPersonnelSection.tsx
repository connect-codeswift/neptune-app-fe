"use client";

import { useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoPersonnelQuery } from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { buildLotoPersonnelColumns } from "./LotoPersonnelColumns";
import { LotoQueryStatus } from "./LotoQueryStatus";
import { LotoRegisterHeader } from "./LotoRegisterHeader";

/** Authorized personnel table — GET /api/Loto/personnel. */
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

  return (
    <Table
      data={personnel}
      columns={columns}
      getRowId={(row) => String(row.id)}
      variant="compliance"
      containerClassName={[complianceGlassCardClass, "min-w-0"].join(" ")}
      header={
        <LotoRegisterHeader
          count={personnel.length}
          itemNoun="person"
          itemNounPlural="people"
        />
      }
    />
  );
}
