"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { UpdateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateHazardMutation } from "@/hooks/use-hazard-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toHazardApiId } from "@/lib/map-hazard";
import { toast } from "@/lib/toast";
import {
  buildHazardEditSchema,
  toHazardEditValues,
  type HazardEditValues,
} from "./hazard-edit-schema";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

/** Keep FormBuilder on the Inter scale without restyling every nested button/p. */
const hazardFormFieldClass = [
  "[&_label]:text8 [&_label]:text-ehs-muted-text",
  "[&_input]:text4 [&_input]:text-ehs-darker",
  "[&_select]:text4 [&_select]:text-ehs-darker",
  "[&_textarea]:text4 [&_textarea]:text-ehs-darker",
].join(" ");

export function EditHazardForm(props: Readonly<{ record: HazardRecord }>) {
  const { record } = props;
  const router = useRouter();
  const saveHazard = useCreateHazardMutation();
  const { userId, siteId } = getCurrentUser();
  const schema = useMemo<FormSchema>(
    () =>
      buildHazardEditSchema(record).map((field) =>
        field.type === "textarea" && field.name === "description"
          ? {
              ...field,
              assistant: (control) => (
                <AiTextAssistant
                  module="hazard"
                  value={control.value}
                  onApply={control.onChange}
                />
              ),
            }
          : field,
      ),
    [record],
  );

  const detailRoute = `/dashboard/hazard/${encodeURIComponent(record.id)}`;

  const handleSubmit = (values: FormValues) => {
    const edited = values as HazardEditValues;

    const payload: UpdateHazardRequestDto = {
      id: Number(toHazardApiId(record.id)),
      type: edited.hazardType,
      location: edited.location,
      description: edited.description,
      image: record.image ?? "",
      // Passed through untouched: the edit form has no photo field, so omitting them would
      // read as "no photos" and wipe the gallery.
      attachments: [...record.attachments],
      userId,
      siteId,
      isDrop: false,
      status: edited.status,
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
