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
import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  CONTRIBUTING_FACTOR_OPTIONS,
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  nearMissReportSchema,
  type NearMissReportValues,
} from "./near-miss-report-schema";

const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";

/** Typography-only overrides — do not set fixed input heights. */
const nearMissFormFieldClass = [
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-gray",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
  "[&_button]:text4",
  "[&_p]:text8",
].join(" ");

/**
 * Ids are what the schema stores; labels are what the model has to read.
 * `"slip-trip-fall"` reaches it as a word to guess at, `"Slip / Trip / Fall"`
 * reaches it as prose. Anything not in the list is a reporter's own custom
 * entry and is already a label.
 */
function toLabel(options: readonly SelectOption[], value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

/** "7 August 2026" reads like a report; the raw ISO string reads like a machine. */
function toReadableDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(parsed);
}

function toCreateRequest(
  report: NearMissReportValues,
): CreateNearMissRequestDto {
  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();

  return {
    dateOfEvent: report.dateOfEvent,
    hazardType: report.hazardType,
    location: report.location,
    whatHappened: report.whatHappened,
    contributingFactor: report.contributingFactors,
    isDrop: false,
    userId,
    siteId,
  };
}

export function ReportNearMissForm() {
  const router = useRouter();
  const createNearMiss = useCreateNearMissMutation();
  const [values, setValues] = useState<FormValues>({});

  const narrative = String(values.whatHappened ?? "");
  // Memoised because the fallback `[]` is a fresh array every render, which
  // would change `draftInput`'s identity on each one and defeat its memo.
  const factorLabels = useMemo(
    () =>
      (Array.isArray(values.contributingFactors)
        ? (values.contributingFactors as string[])
        : []
      ).map((factor) => toLabel(CONTRIBUTING_FACTOR_OPTIONS, factor)),
    [values.contributingFactors],
  );

  const draftInput = useMemo(
    () => ({
      dateOfEvent: toReadableDate(String(values.dateOfEvent ?? "")),
      hazardType: toLabel(HAZARD_TYPE_OPTIONS, String(values.hazardType ?? "")),
      location: toLabel(LOCATION_OPTIONS, String(values.location ?? "")),
      contributingFactors: factorLabels,
    }),
    [values.dateOfEvent, values.hazardType, values.location, factorLabels],
  );

  const { draft, pending, dismiss } = useNarrativeDraft({
    module: "nearMiss",
    input: draftInput,
    // At least one contributing factor, or the backend returns null anyway.
    // Never while the reporter has written their own account — the request
    // carries no field for it and their words are the record.
    enabled: factorLabels.length > 0 && narrative.trim() === "",
  });

  const showsDraft = pending || draft !== null;

  const schema = useMemo<FormSchema>(
    () =>
      nearMissReportSchema.map((field) =>
        field.type === "textarea" && field.name === "whatHappened"
          ? {
              ...field,
              // Suppressed while a draft occupies the field, or the browser
              // paints the placeholder underneath the ghost text.
              placeholder: showsDraft ? "" : field.placeholder,
              assistant: (control) =>
                showsDraft ? (
                  <AiInFieldDraft
                    draft={draft}
                    pending={pending}
                    // FormBuilder's textarea is a different skin from the
                    // incident wizard's — 16px text, 12px padding — and the
                    // ghost has to sit exactly on the caret.
                    fieldPaddingClassName="px-3 pt-2.5"
                    fieldTextClassName="text4 leading-6"
                    onAccept={(text) => {
                      control.onChange(text);
                      dismiss();
                    }}
                    onDismiss={dismiss}
                  />
                ) : (
                  <AiTextAssistant
                    module="nearMiss"
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
    // Values are keyed by the schema field names, matching NearMissReportValues.
    const payload = toCreateRequest(values as NearMissReportValues);

    createNearMiss.mutate(payload, {
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the near-miss report. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6 sm:p-8"
      // No `bg-white!`: that override forced the card opaque, so this was the
      // one solid slab on an otherwise frosted page. Width comes from the
      // page container now, so the card and the header above it line up.
      className="w-full"
    >
      <FormBuilder
        schema={schema}
        onChange={setValues}
        className={nearMissFormFieldClass}
        submitLabel={
          createNearMiss.isPending ? "Submitting..." : "Submit Near-Miss Report"
        }
        cancelLabel="Cancel"
        isSubmitting={createNearMiss.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(NEAR_MISS_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
