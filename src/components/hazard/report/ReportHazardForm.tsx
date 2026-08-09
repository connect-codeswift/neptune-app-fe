"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { useNarrativeDraft } from "@/hooks/use-narrative-draft";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { CreateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateHazardMutation } from "@/hooks/use-hazard-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  POTENTIAL_CONSEQUENCE_OPTIONS,
  hazardReportSchema,
  type HazardReportValues,
} from "./hazard-report-schema";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

/** Ids are what the schema stores; the model needs the label it was shown. */
function toLabel(options: readonly SelectOption[], value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

function toCreateRequest(report: HazardReportValues): CreateHazardRequestDto {
  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();

  return {
    type: report.hazardType,
    location: report.location,
    description: report.description,
    // The endpoint takes a single URL; the field is capped at one photo.
    image: report.photos[0] ?? "",
    // Assignment happens after triage, so nobody is assigned on create.
    assignedTo: 0,
    userId,
    siteId,
    isDrop: false,
  };
}

export function ReportHazardForm() {
  const router = useRouter();
  const createHazard = useCreateHazardMutation();
  const [values, setValues] = useState<FormValues>({});

  const description = String(values.description ?? "");
  const consequence = toLabel(
    POTENTIAL_CONSEQUENCE_OPTIONS,
    String(values.potentialConsequence ?? ""),
  );

  const draftInput = useMemo(
    () => ({
      hazardType: toLabel(HAZARD_TYPE_OPTIONS, String(values.hazardType ?? "")),
      location: toLabel(LOCATION_OPTIONS, String(values.location ?? "")),
      potentialConsequence: consequence,
    }),
    [values.hazardType, values.location, consequence],
  );

  const { draft, pending, dismiss } = useNarrativeDraft({
    module: "hazard",
    input: draftInput,
    // The consequence is the backend's threshold — type and location alone
    // return null. Never while the reporter has written their own account.
    enabled: consequence !== "" && description.trim() === "",
  });

  const showsDraft = pending || draft !== null;

  const schema = useMemo<FormSchema>(
    () =>
      hazardReportSchema.map((field) =>
        field.type === "textarea" && field.name === "description"
          ? {
              ...field,
              placeholder: showsDraft ? "" : field.placeholder,
              assistant: (control) =>
                showsDraft ? (
                  <AiInFieldDraft
                    draft={draft}
                    pending={pending}
                    // FormBuilder's textarea skin, not the incident wizard's.
                    fieldPaddingClassName="px-3 pt-2.5"
                    fieldTextClassName="text-base leading-6"
                    onAccept={(text) => {
                      control.onChange(text);
                      dismiss();
                    }}
                    onDismiss={dismiss}
                  />
                ) : (
                  <AiTextAssistant
                    module="hazard"
                    value={control.value}
                    onApply={control.onChange}
                  />
                ),
            }
          : field,
      ),
    [showsDraft, draft, pending, dismiss],
  );

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching HazardReportValues.
    const payload = toCreateRequest(values as HazardReportValues);

    createHazard.mutate(payload, {
      onSuccess: () => {
        toast.success("Hazard report submitted");
        router.push(HAZARD_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the hazard report. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="min-h-155 w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        schema={schema}
        onChange={setValues}
        submitLabel={
          createHazard.isPending ? "Submitting..." : "Submit Hazard Report"
        }
        cancelLabel="Cancel"
        isSubmitting={createHazard.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(HAZARD_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
