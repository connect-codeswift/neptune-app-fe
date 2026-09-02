"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  FormBuilder,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  buildTrainingSessionSchema,
  HAZCOM_TRAINING_FORM_ID,
  HAZCOM_TRAINING_INITIAL_VALUES,
  HAZCOM_TRAINING_LOG_ROUTE,
  toTrainingLogRequest,
} from "@/components/hazcom/training/hazcom-training-schema";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { useDraftMutation } from "@/hooks/use-ai-text-mutations";
import { logAiAssistFailure } from "@/services/ai-text.service";
import { useCreateTrainingLogMutation } from "@/hooks/use-hazcom-mutations";
import { useChemicalNamesQuery } from "@/hooks/use-hazcom-queries";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

export type HazcomNewTrainingSessionFormProps = Readonly<{
  className?: string;
}>;

export function HazcomNewTrainingSessionForm(
  props: Readonly<HazcomNewTrainingSessionFormProps>,
) {
  const { className = "" } = props;
  const router = useRouter();
  const createTrainingLog = useCreateTrainingLogMutation();
  // Held past the response: `isPending` drops when the record is saved, while
  // the navigation away is still in flight. A click in that gap saved a
  // duplicate.
  const submitLock = useSubmitLock();
  const { chemicals, isLoading: isLoadingChemicals } = useChemicalNamesQuery();
  // The form owns its own state, so the one value the schema depends on is
  // mirrored here. Only `trainerId` is read back out — keeping the memo keyed
  // on that string rather than the whole map means typing in Notes does not
  // rebuild the schema.
  const [formValues, setFormValues] = useState<FormValues>(
    HAZCOM_TRAINING_INITIAL_VALUES,
  );
  const trainerId = String(formValues.trainerId ?? "");

  const auth = useMemo(() => getAuthContext(), []);
  const siteId = auth?.siteId ?? 0;
  const siteName = auth?.siteName ?? null;
  // Both people fields fetch for themselves; the form only says where from.
  const usersSource = siteId > 0 ? "site" : "org";

  const chemicalOptions: readonly SelectOption[] = useMemo(
    () =>
      chemicals.map((chemical) => ({
        value: String(chemical.id),
        label: chemical.name,
      })),
    [chemicals],
  );

  /**
   * What the notes are drafted from, and what a rewrite is read against.
   *
   * Keyed on the individual fields rather than on `formValues`, because
   * FormBuilder rebuilds that object on every keystroke while leaving untouched
   * values at the same identity. Depending on the map would rebuild the schema
   * as the trainer types in Notes — and remount the very textarea they are
   * typing in.
   *
   * The trainer's name is not here: the picker fetches people itself and the
   * form only ever sees the id. Their title is on the form and does travel.
   */
  const draftContext = useMemo(() => {
    const chemicalIds = Array.isArray(formValues.chemicalIds)
      ? (formValues.chemicalIds as string[])
      : [];
    const attendees = Array.isArray(formValues.attendees)
      ? (formValues.attendees as unknown[])
      : [];
    const materials = Array.isArray(formValues.materials)
      ? (formValues.materials as unknown[])
      : [];

    const chemicalNames = chemicalIds
      .map(
        (id) =>
          chemicalOptions.find((option) => option.value === id)?.label ?? "",
      )
      .filter(Boolean)
      .join(", ");

    return {
      "Chemicals covered": chemicalNames,
      "Session date": String(formValues.sessionDate ?? ""),
      "Trainer title": String(formValues.trainerTitle ?? ""),
      Attendees:
        attendees.length > 0 ? `${String(attendees.length)} people` : "",
      Materials:
        materials.length > 0 ? `${String(materials.length)} attached` : "",
    };
  }, [
    formValues.chemicalIds,
    formValues.sessionDate,
    formValues.trainerTitle,
    formValues.attendees,
    formValues.materials,
    chemicalOptions,
  ]);

  const [notesDraftPending, setNotesDraftPending] = useState(false);
  const draftMutation = useDraftMutation("training");

  const runNotesDraft = (apply: (next: string) => void) => {
    setNotesDraftPending(true);
    draftMutation
      .mutateAsync({ fields: draftContext })
      .then((results) => {
        const narrative = results.narrative ?? null;

        // Null is an answer: nothing is filled in yet, so a note could only
        // restate one field.
        if (narrative === null) {
          toast.info(
            "Nothing to draft yet",
            "Fill in the session details above and try again.",
          );
          return;
        }

        apply(narrative);
      })
      .catch((error: unknown) => {
        logAiAssistFailure("training-draft", error);
        toast.error(
          "Couldn't draft the notes",
          "Your text is unchanged. Try again in a moment.",
        );
      })
      .finally(() => {
        setNotesDraftPending(false);
      });
  };

  const schema = useMemo(
    () =>
      buildTrainingSessionSchema({
        chemicalOptions: isLoadingChemicals
          ? [{ value: "", label: "Loading chemicals…" }]
          : chemicalOptions,
        siteId,
        siteName,
        usersSource,
        trainerId,
        notesAssistant: (control) => (
          <AiTextAssistant
            module="training"
            value={control.value}
            onApply={control.onChange}
            contextFields={draftContext}
            draftPending={notesDraftPending}
            onRegenerateDraft={() => runNotesDraft(control.onChange)}
          />
        ),
      }),
    // draftContext and notesDraftPending belong here: the first is what the
    // draft and the rewrites are given, and without the second the button's
    // spinner never appears. Neither changes while typing in Notes.
    //
    // runNotesDraft is excluded deliberately — a new function every render, and
    // including it would remount the textarea on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chemicalOptions,
      isLoadingChemicals,
      siteId,
      siteName,
      usersSource,
      trainerId,
      draftContext,
      notesDraftPending,
    ],
  );

  const goBack = () => {
    router.push(HAZCOM_TRAINING_LOG_ROUTE);
  };

  const handleSubmit = (values: FormValues) => {
    const payload = toTrainingLogRequest(values);
    if ("error" in payload) {
      toast.error(payload.error);
      return;
    }

    if (!submitLock.acquire()) {
      return;
    }

    createTrainingLog.mutate(payload, {
      onSuccess: () => {
        toast.success("Training session logged");
        goBack();
      },
      onError: (error) => {
        submitLock.release();
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the training session. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6 sm:p-8"
      className={["w-full min-w-0 rounded-2xl", className]
        .filter(Boolean)
        .join(" ")}
      incidentGlassCardClassName="gap-0"
    >
      <FormBuilder
        formId={HAZCOM_TRAINING_FORM_ID}
        schema={schema}
        initialValues={HAZCOM_TRAINING_INITIAL_VALUES}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        hideActions
        className="gap-4.5"
      />

      <div className="border-ehs-border-ink/8 mt-6 flex flex-wrap items-center justify-end gap-2 border-t pt-5">
        <Button
          type="button"
          variant="tertiary"
          onClick={goBack}
          disabled={submitLock.isLocked}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={HAZCOM_TRAINING_FORM_ID}
          variant="primary"
          isLoading={submitLock.isLocked}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-(--ehs-shadow-button-primary-flat)"
        >
          <Icon icon="mdi:check" className="size-4" aria-hidden />
          Save Session
        </Button>
      </div>
    </IncidentGlassCard>
  );
}
