"use client";

import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { UpdateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toNearMissApiId } from "@/lib/map-near-miss";
import { toast } from "@/lib/toast";
import {
  buildNearMissEditSchema,
  toNearMissEditValues,
  type NearMissEditValues,
} from "./near-miss-edit-schema";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const nearMissFormFieldClass = [
  "[&_label]:text8 [&_label]:text-ehs-muted-text",
  "[&_input]:text4 [&_input]:text-ehs-darker",
  "[&_select]:text4 [&_select]:text-ehs-darker",
  "[&_textarea]:text4 [&_textarea]:text-ehs-darker",
].join(" ");

export function EditNearMissForm(props: Readonly<{ record: NearMissRecord }>) {
  const { record } = props;
  const router = useRouter();
  const saveNearMiss = useCreateNearMissMutation();
  const { userId, siteId } = getCurrentUser();
  const schema = buildNearMissEditSchema(record);

  const detailRoute = `/dashboard/near-miss/${encodeURIComponent(record.id)}`;

  const handleSubmit = (values: FormValues) => {
    const edited = values as NearMissEditValues;
    const contributingFactors = Array.isArray(edited.contributingFactors)
      ? edited.contributingFactors
      : [];

    const payload: UpdateNearMissRequestDto = {
      id: Number(toNearMissApiId(record.id)),
      dateOfEvent: edited.dateOfEvent,
      hazardType: edited.hazardType,
      location: edited.location,
      whatHappened: edited.whatHappened,
      contributingFactor: contributingFactors,
      isDrop: false,
      userId,
      siteId,
    };

    saveNearMiss.mutate(payload, {
      onSuccess: () => {
        toast.success("Near miss updated");
        router.push(detailRoute);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the near miss. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard paddingClassName="p-6" className="w-full">
      <FormBuilder
        schema={schema}
        initialValues={toNearMissEditValues(record)}
        className={nearMissFormFieldClass}
        submitLabel={saveNearMiss.isPending ? "Saving..." : "Save Changes"}
        cancelLabel="Cancel"
        isSubmitting={saveNearMiss.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(detailRoute)}
      />
    </IncidentGlassCard>
  );
}
