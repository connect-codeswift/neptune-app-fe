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
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateNearMissMutation } from "@/hooks/use-near-miss-mutations";
import {
  useChemicalNamesQuery,
  useSdsListQuery,
} from "@/hooks/use-hazcom-queries";
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

/** Keep FormBuilder on the Inter scale without restyling every nested button/p. */
const nearMissFormFieldClass = [
  "[&_label]:text8 [&_label]:text-ehs-muted-text",
  "[&_input]:text4 [&_input]:text-ehs-darker",
  "[&_select]:text4 [&_select]:text-ehs-darker",
  "[&_textarea]:text4 [&_textarea]:text-ehs-darker",
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

  // Only a chemical hazard carries a chemical; the id is the HazCom row id.
  const chemicalId = Number(String(report.chemicalId ?? "").trim());

  return {
    dateOfEvent: report.dateOfEvent,
    hazardType: report.hazardType,
    ...(Number.isFinite(chemicalId) && chemicalId > 0 ? { chemicalId } : {}),
    location: report.location,
    whatHappened: report.whatHappened,
    contributingFactor: report.contributingFactors,
    attachments: report.photos,
    isDrop: false,
    userId,
    siteId,
  };
}

export function ReportNearMissForm() {
  const router = useRouter();
  const createNearMiss = useCreateNearMissMutation();
  // Held past the response: `isPending` drops as soon as the record is
  // created, while the push to the list is still in flight, and a click in
  // that gap filed a duplicate report.
  const submitLock = useSubmitLock();
  const [values, setValues] = useState<FormValues>({});

  const { chemicals } = useChemicalNamesQuery();
  const { items: sdsRecords } = useSdsListQuery({ pageSize: 500 });

  // Chemical:SDS is 1:1 — only offer chemicals that already have an SDS.
  const chemicalIdsWithSds = useMemo(
    () =>
      new Set(
        sdsRecords
          .map((sds) => sds.chemicalId)
          .filter((id): id is number => id !== null),
      ),
    [sdsRecords],
  );

  const chemicalOptions: readonly SelectOption[] = useMemo(
    () =>
      chemicals
        .filter((chemical) => chemicalIdsWithSds.has(chemical.id))
        .map((chemical) => ({
          value: String(chemical.id),
          label: chemical.name,
        })),
    [chemicals, chemicalIdsWithSds],
  );

  const isChemicalHazard = String(values.hazardType ?? "") === "chemical";

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

  // Keyed by the label the form shows, because the model reads the keys as
  // prose alongside the values. The factors go as one comma-separated line
  // rather than an array — the prompt talks about them as a set.
  const draftInput = useMemo(
    () => ({
      "Date of event": toReadableDate(String(values.dateOfEvent ?? "")),
      "Hazard type": toLabel(
        HAZARD_TYPE_OPTIONS,
        String(values.hazardType ?? ""),
      ),
      Location: toLabel(LOCATION_OPTIONS, String(values.location ?? "")),
      "Contributing factors": factorLabels.join(", "),
    }),
    [values.dateOfEvent, values.hazardType, values.location, factorLabels],
  );

  const { draft, pending, dismiss, regenerate, canRegenerate } =
    useNarrativeDraft({
      module: "nearMiss",
      input: draftInput,
      // At least one contributing factor, or the backend returns null anyway.
      // Never while the reporter has written their own account — the request
      // carries no field for it and their words are the record.
      enabled: factorLabels.length > 0 && narrative.trim() === "",
    });

  const showsDraft = pending || draft !== null;

  const schema = useMemo<FormSchema>(() => {
    const mapped: FormSchema = nearMissReportSchema.map((field) => {
      if (field.type === "textarea" && field.name === "whatHappened") {
        return {
          ...field,
          // Suppressed while a draft occupies the field, or the browser
          // paints the placeholder underneath the ghost text.
          placeholder: showsDraft ? "" : field.placeholder,
          assistant: (control) =>
            showsDraft ? (
              <AiInFieldDraft
                draft={draft}
                pending={pending}
                onRegenerate={canRegenerate ? regenerate : undefined}
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
                contextFields={draftInput}
                onRegenerateDraft={canRegenerate ? regenerate : undefined}
              />
            ),
        };
      }

      // A chemical hazard pairs "Which chemical" beside Location, so Location
      // narrows to half width instead of leaving a gap next to the picker.
      if (
        isChemicalHazard &&
        field.type === "select" &&
        field.name === "location"
      ) {
        return { ...field, colSpan: 6 };
      }

      return field;
    });

    if (!isChemicalHazard) {
      return mapped;
    }

    // Insert the chemical picker directly after "Hazard type".
    const hazardTypeIndex = mapped.findIndex(
      (field) => field.name === "hazardType",
    );

    return [
      ...mapped.slice(0, hazardTypeIndex + 1),
      {
        type: "select",
        name: "chemicalId",
        label: "Which chemical",
        colSpan: 6,
        placeholder: "Select a chemical",
        options: chemicalOptions,
      } as const,
      ...mapped.slice(hazardTypeIndex + 1),
    ];
    // draftInput is what the rewrite sends as context. It changes on a dropdown
    // selection rather than per keystroke, so listing it costs no field focus,
    // and leaving it out meant a rewrite could be sent the answers as they stood
    // when the schema was last built.
  }, [
    showsDraft,
    draft,
    pending,
    dismiss,
    regenerate,
    canRegenerate,
    isChemicalHazard,
    chemicalOptions,
    draftInput,
  ]);

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching NearMissReportValues.
    const payload = toCreateRequest(values as NearMissReportValues);

    if (!submitLock.acquire()) {
      return;
    }

    createNearMiss.mutate(payload, {
      onSuccess: () => {
        toast.success("Near-miss report submitted");
        router.push(NEAR_MISS_LIST_ROUTE);
      },
      onError: (error) => {
        submitLock.release();
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
      // No `bg-ehs-surface!`: that override forced the card opaque, so this was the
      // one solid slab on an otherwise frosted page. Width comes from the
      // page container now, so the card and the header above it line up.
      className="w-full"
    >
      <FormBuilder
        schema={schema}
        onChange={setValues}
        className={nearMissFormFieldClass}
        submitLabel={
          submitLock.isLocked ? "Submitting..." : "Submit Near-Miss Report"
        }
        cancelLabel="Cancel"
        isSubmitting={submitLock.isLocked}
        onSubmit={handleSubmit}
        onCancel={() => router.push(NEAR_MISS_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
