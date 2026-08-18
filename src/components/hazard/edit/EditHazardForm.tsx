"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { UpdateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateHazardMutation } from "@/hooks/use-hazard-mutations";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toHazardApiId } from "@/lib/map-hazard";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildHazardEditSchema,
  toHazardEditValues,
  type HazardEditValues,
} from "./hazard-edit-schema";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

/** Typography-only overrides — do not set fixed input heights. */
const hazardFormFieldClass = [
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-gray",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
  "[&_button]:text4",
  "[&_p]:text8",
].join(" ");

export function EditHazardForm(props: Readonly<{ record: HazardRecord }>) {
  const { record } = props;
  const router = useRouter();
  const saveHazard = useCreateHazardMutation();

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const schema = useMemo(
    () => buildHazardEditSchema(toAssigneeOptions(users ?? [])),
    [users],
  );

  const detailRoute = `/dashboard/hazard/${encodeURIComponent(record.id)}`;

  const handleSubmit = (values: FormValues) => {
    const edited = values as HazardEditValues;

    const payload: UpdateHazardRequestDto = {
      id: Number(toHazardApiId(record.id)),
      status: edited.status,
      assignedTo: Number(edited.assignedTo) || 0,
      description: edited.description,
    };

    saveHazard.mutate(payload, {
      onSuccess: () => {
        toast.success("Hazard updated");
        router.push(detailRoute);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the hazard. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard paddingClassName="p-6" className="w-full">
      <FormBuilder
        schema={schema}
        initialValues={toHazardEditValues(record)}
        className={hazardFormFieldClass}
        submitLabel={saveHazard.isPending ? "Saving..." : "Save Changes"}
        cancelLabel="Cancel"
        isSubmitting={saveHazard.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(detailRoute)}
      />
    </IncidentGlassCard>
  );
}
