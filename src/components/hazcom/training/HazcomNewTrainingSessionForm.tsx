"use client";

import { useMemo } from "react";
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

  const schema = useMemo(
    () =>
      buildTrainingSessionSchema({
        chemicalOptions: isLoadingChemicals
          ? [{ value: "", label: "Loading chemicals…" }]
          : chemicalOptions,
        siteId,
        siteName,
        usersSource,
      }),
    [chemicalOptions, isLoadingChemicals, siteId, siteName, usersSource],
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
