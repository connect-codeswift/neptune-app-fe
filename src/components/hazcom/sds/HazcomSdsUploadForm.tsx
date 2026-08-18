"use client";

import { useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  FormBuilder,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  buildSdsUploadSchema,
  HAZCOM_SDS_FORM_ID,
  HAZCOM_SDS_INITIAL_VALUES,
  HAZCOM_SDS_LIBRARY_ROUTE,
  toSdsRequest,
} from "@/components/hazcom/sds/hazcom-sds-schema";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateSdsMutation } from "@/hooks/use-hazcom-mutations";
import { useChemicalNamesQuery } from "@/hooks/use-hazcom-queries";
import { toast } from "@/lib/toast";

export type HazcomSdsUploadFormProps = Readonly<{
  className?: string;
}>;

export function HazcomSdsUploadForm(props: Readonly<HazcomSdsUploadFormProps>) {
  const { className = "" } = props;
  const router = useRouter();
  const createSds = useCreateSdsMutation();
  const saveAsDraftRef = useRef(false);
  const { chemicals, isLoading: isLoadingChemicals } = useChemicalNamesQuery();

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
      buildSdsUploadSchema({
        chemicalOptions: isLoadingChemicals
          ? [{ value: "", label: "Loading chemicals…" }]
          : chemicalOptions,
      }),
    [chemicalOptions, isLoadingChemicals],
  );

  const goBack = () => {
    router.push(HAZCOM_SDS_LIBRARY_ROUTE);
  };

  const submit = (values: FormValues, isDraft: boolean) => {
    const payload = toSdsRequest(values, isDraft);
    if ("error" in payload) {
      toast.error(payload.error);
      return;
    }

    createSds.mutate(payload, {
      onSuccess: () => {
        toast.success(isDraft ? "SDS saved as draft" : "SDS record saved");
        goBack();
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not save the SDS record. Please try again.",
          ),
        );
      },
    });
  };

  const handleSubmit = (values: FormValues) => {
    const isDraft = saveAsDraftRef.current;
    saveAsDraftRef.current = false;
    submit(values, isDraft);
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
        formId={HAZCOM_SDS_FORM_ID}
        schema={schema}
        initialValues={HAZCOM_SDS_INITIAL_VALUES}
        onSubmit={handleSubmit}
        hideActions
        className="gap-4.5"
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(15,23,42,0.08)] pt-5">
        <Button
          type="button"
          variant="tertiary"
          onClick={goBack}
          disabled={createSds.isPending}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold"
        >
          <Icon icon="mdi:arrow-left" className="size-4" aria-hidden />
          Cancel
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={createSds.isPending}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold"
            onClick={() => {
              saveAsDraftRef.current = true;
              const form = document.getElementById(HAZCOM_SDS_FORM_ID);
              if (form instanceof HTMLFormElement) {
                form.requestSubmit();
              }
            }}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            form={HAZCOM_SDS_FORM_ID}
            variant="primary"
            isLoading={createSds.isPending}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-[0px_6px_18px_-6px_#0891a6]"
            onClick={() => {
              saveAsDraftRef.current = false;
            }}
          >
            <Icon icon="mdi:tray-arrow-up" className="size-4" aria-hidden />
            Save SDS Record
          </Button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
