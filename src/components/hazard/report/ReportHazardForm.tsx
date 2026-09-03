"use client";

import { useMemo, useState } from "react";
import { useLocationsQuery } from "@/hooks/use-location-queries";
import type { LocationDto } from "@/dtos/res/location-response.dto";
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
import { useDraftMutation } from "@/hooks/use-ai-text-mutations";
import { logAiAssistFailure } from "@/services/ai-text.service";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { CreateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateHazardMutation } from "@/hooks/use-hazard-mutations";
import {
  useChemicalNamesQuery,
  useSdsListQuery,
} from "@/hooks/use-hazcom-queries";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  HAZARD_TYPE_OPTIONS,
  POTENTIAL_CONSEQUENCE_OPTIONS,
  hazardReportSchema,
  type HazardReportValues,
} from "./hazard-report-schema";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

/** Keep FormBuilder on the Inter scale without restyling every nested button/p. */
const hazardFormFieldClass = [
  "[&_label]:text8 [&_label]:text-ehs-muted-text",
  "[&_input]:text4 [&_input]:text-ehs-darker",
  "[&_select]:text4 [&_select]:text-ehs-darker",
  "[&_textarea]:text4 [&_textarea]:text-ehs-darker",
].join(" ");

/** Ids are what the schema stores; the model needs the label it was shown. */
function toLabel(options: readonly SelectOption[], value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

function toCreateRequest(
  report: HazardReportValues,
  locations: readonly LocationDto[],
): CreateHazardRequestDto {
  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();

  // Only a chemical hazard carries a chemical; the id is the HazCom row id.
  const chemicalId = Number(String(report.chemicalId ?? "").trim());

  return {
    type: report.hazardType,
    ...(Number.isFinite(chemicalId) && chemicalId > 0 ? { chemicalId } : {}),
    // The field holds the register row's id; the API takes the id and keeps the name for
    // readers that predate it. A location typed before the register existed has no id and
    // still round-trips as text.
    location:
      locations.find((entry) => String(entry.id) === report.location)?.name ??
      report.location,
    locationId: Number(report.location) || null,
    description: report.description,
    // Both are sent: `attachments` is the list the endpoint stores, `image` keeps the first so an
    // older reader still finds a photo where it expects one.
    image: report.photos[0] ?? "",
    attachments: report.photos,
    userId,
    siteId,
    isDrop: false,
  };
}

export function ReportHazardForm() {
  const locationsQuery = useLocationsQuery();
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data]);

  const router = useRouter();
  const createHazard = useCreateHazardMutation();
  // Held past the response: `isPending` drops as soon as the record is
  // created, while the push to the list is still in flight, and a click in
  // that gap filed a duplicate report.
  const submitLock = useSubmitLock();
  const [values, setValues] = useState<FormValues>({});

  const { chemicals } = useChemicalNamesQuery();
  const { items: sdsRecords } = useSdsListQuery({ pageSize: 500 });

  // Chemical:SDS is 1:1 — only offer chemicals that already have an SDS, so a
  // "which chemical" pick always points at a record the viewer can open.
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

  const description = String(values.description ?? "");
  const consequence = toLabel(
    POTENTIAL_CONSEQUENCE_OPTIONS,
    String(values.potentialConsequence ?? ""),
  );

  // Keyed by the label the form shows, because the model reads the keys as
  // prose alongside the values.
  const draftInput = useMemo(
    () => ({
      "Hazard type": toLabel(
        HAZARD_TYPE_OPTIONS,
        String(values.hazardType ?? ""),
      ),
      Location:
        locations.find((entry) => String(entry.id) === String(values.location ?? ""))
          ?.name ?? String(values.location ?? ""),
      "Potential consequence if not addressed": consequence,
    }),
    [values.hazardType, values.location, consequence, locations],
  );

  const { draft, pending, dismiss, regenerate, canRegenerate } =
    useNarrativeDraft({
      module: "hazard",
      input: draftInput,
      // The consequence is the backend's threshold — type and location alone
      // return null. Never while the reporter has written their own account.
      enabled: consequence !== "" && description.trim() === "",
    });

  const showsDraft = pending || draft !== null;

  // A Draft button, alongside the automatic ghost above.
  //
  // The ghost only ever appears on an empty description, and `useNarrativeDraft`
  // gates its result on that too — so once the reporter has written something,
  // regenerating through that hook produces a draft with nowhere to go. This
  // path writes straight into the field instead, which is what "Redraft" has to
  // mean once there are words to replace.
  const [buttonDraftPending, setButtonDraftPending] = useState(false);
  const draftMutation = useDraftMutation("hazard");

  const runButtonDraft = (apply: (next: string) => void) => {
    if (consequence === "") {
      toast.info(
        "Answer a little more first",
        "Pick what could happen if this isn't fixed — a type and a location alone only restate the dropdowns.",
      );
      return;
    }

    setButtonDraftPending(true);
    draftMutation
      .mutateAsync({ fields: draftInput })
      .then((results) => {
        // These forms draft one field, and the prompt calls it the narrative.
        const narrative = results.narrative ?? null;

        if (narrative === null) {
          toast.info(
            "Nothing to draft yet",
            "The answers given do not support a description. Add a little more and try again.",
          );
          return;
        }

        apply(narrative);
      })
      .catch((error: unknown) => {
        logAiAssistFailure("hazard-draft", error);
        toast.error(
          "Couldn't draft a description",
          "Your text is unchanged. Try again in a moment.",
        );
      })
      .finally(() => {
        setButtonDraftPending(false);
      });
  };

  const schema = useMemo<FormSchema>(() => {
    const mapped: FormSchema = hazardReportSchema.map((field) =>
      // The register is the only source of locations now; the hardcoded six never matched
      // what anyone actually reported against.
      field.type === "select" && field.name === "location"
        ? {
            ...field,
            options: locations.map((entry) => ({
              value: String(entry.id),
              label: entry.name,
            })),
          } :
      field.type === "textarea" && field.name === "description"
        ? {
            ...field,
            placeholder: showsDraft ? "" : field.placeholder,
            assistant: (control) =>
              showsDraft ? (
                <AiInFieldDraft
                  draft={draft}
                  pending={pending}
                  onRegenerate={canRegenerate ? regenerate : undefined}
                  // FormBuilder's textarea skin, not the incident wizard's.
                  fieldPaddingClassName="px-3 pt-2.5"
                  fieldTextClassName="text4 text-ehs-darker leading-normal"
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
                  contextFields={draftInput}
                  draftPending={buttonDraftPending}
                  onRegenerateDraft={() => runButtonDraft(control.onChange)}
                />
              ),
          }
        : field,
    );

    if (!isChemicalHazard) {
      return mapped;
    }

    // Insert the chemical picker directly after "Hazard Type".
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
    // draftInput and buttonDraftPending belong here: the first is what the
    // rewrite sends as context, and without the second the Draft button's
    // spinner never appears, because the schema — and so the assistant's props —
    // would not rebuild when it flips. Both change on a dropdown selection, not
    // per keystroke, so neither costs field focus.
    //
    // runButtonDraft is deliberately excluded: it is a new function every render
    // and including it would rebuild the schema on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    buttonDraftPending,
    locations,
  ]);

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching HazardReportValues.
    const payload = toCreateRequest(values as HazardReportValues, locations);

    if (!submitLock.acquire()) {
      return;
    }

    createHazard.mutate(payload, {
      onSuccess: () => {
        toast.success("Hazard report submitted");
        router.push(HAZARD_LIST_ROUTE);
      },
      onError: (error) => {
        submitLock.release();
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
      paddingClassName="p-6 sm:p-8"
      // Was `min-h-155 max-w-3xl bg-ehs-surface!`: the forced 620px floor left a
      // block of dead space under the last field, max-w-3xl made the card
      // narrower than its own page header, and bg-ehs-surface! overrode the glass so
      // this was the one opaque slab on the page. Width comes from the page
      // container now, height from the content.
      className="w-full"
    >
      <FormBuilder
        schema={schema}
        onChange={setValues}
        className={hazardFormFieldClass}
        submitLabel={
          submitLock.isLocked ? "Submitting..." : "Submit Hazard Report"
        }
        cancelLabel="Cancel"
        isSubmitting={submitLock.isLocked}
        onSubmit={handleSubmit}
        onCancel={() => router.push(HAZARD_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
