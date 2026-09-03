"use client";

import { useMemo } from "react";
import { useLocationsQuery } from "@/hooks/use-location-queries";
import { useRouter } from "next/navigation";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";
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
  const locationsQuery = useLocationsQuery();
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data]);

  const { record } = props;
  const router = useRouter();
  const saveNearMiss = useCreateNearMissMutation();
  const { userId, siteId } = getCurrentUser();
  const schema = useMemo<FormSchema>(
    () =>
      buildNearMissEditSchema(record, locations).map((field) =>
        field.type === "textarea" && field.name === "whatHappened"
          ? {
              ...field,
              assistant: (control) => (
                <AiTextAssistant
                  module="nearMiss"
                  value={control.value}
                  onApply={control.onChange}
                />
              ),
            }
          : field,
      ),
    [record],
  );

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
      // The picker holds the register row's id once a record has been re-saved against it.
      // A record still carrying free text from before the register keeps its text and no id,
      // which is what the API's fallback expects.
      location:
        locations.find((entry) => String(entry.id) === edited.location)?.name ??
        edited.location,
      locationId: Number(edited.location) || null,
      whatHappened: edited.whatHappened,
      contributingFactor: contributingFactors,
      // Passed through untouched — the edit form has no photo field, so omitting them
      // would read as "no photos" and wipe the gallery.
      attachments: [...record.attachments],
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
        initialValues={toNearMissEditValues(record, locations)}
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
