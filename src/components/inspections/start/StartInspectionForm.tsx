"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildStartInspectionSchema,
  type StartInspectionValues,
} from "./start-inspection-schema";

const INSPECTION_LIST_ROUTE = "/dashboard/inspections";

export function StartInspectionForm() {
  const router = useRouter();

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const schema = useMemo(
    () => buildStartInspectionSchema(toAssigneeOptions(users ?? [])),
    [users],
  );

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching StartInspectionValues.
    const inspection = values as StartInspectionValues;

    // TODO: wire to an inspection-create mutation once the service exists.
    void inspection;

    toast.success("Inspection created");
    router.push(INSPECTION_LIST_ROUTE);
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="mx-auto w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        schema={schema}
        submitLabel="Begin Inspection"
        cancelLabel="Cancel"
        onSubmit={handleSubmit}
        onCancel={() => router.push(INSPECTION_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
