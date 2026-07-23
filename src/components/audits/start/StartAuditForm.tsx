"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildStartAuditSchema,
  type StartAuditValues,
} from "./start-audit-schema";

const AUDIT_LIST_ROUTE = "/dashboard/audits";

export function StartAuditForm() {
  const router = useRouter();

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const schema = useMemo(
    () => buildStartAuditSchema(toAssigneeOptions(users ?? [])),
    [users],
  );

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching StartAuditValues.
    const audit = values as StartAuditValues;

    // TODO: wire to an audit-create mutation once the service exists.
    void audit;

    toast.success("Audit created");
    router.push(AUDIT_LIST_ROUTE);
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="mx-auto w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        schema={schema}
        submitLabel="Begin Audit"
        cancelLabel="Cancel"
        onSubmit={handleSubmit}
        onCancel={() => router.push(AUDIT_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
