"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateSdsMutation } from "@/hooks/use-hazcom-mutations";
import {
  hazcomQueryKeys,
  useChemicalNamesQuery,
  useSdsListQuery,
} from "@/hooks/use-hazcom-queries";
import { getChemicalById } from "@/services/hazcom.service";
import { mapChemicalDtoToHazcomChemical } from "@/services/mappers/hazcom-chemical.mapper";
import { toast } from "@/lib/toast";

/**
 * Large enough to cover the SDS library in one page for every real org
 * today. The FK lives on the SDS side (`SafetyDataSheet.ChemicalId`) —
 * `Chemical` itself carries no back-reference — so this is what backs the
 * "hide chemicals that already have an SDS" filter below. A true
 * set-difference would need a dedicated backend filter if the library ever
 * outgrows one page.
 */
const SDS_LIST_PAGE_SIZE = 500;

export type HazcomSdsUploadFormProps = Readonly<{
  className?: string;
}>;

export function HazcomSdsUploadForm(props: Readonly<HazcomSdsUploadFormProps>) {
  const { className = "" } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const createSds = useCreateSdsMutation();
  // Held past the response: `isPending` drops when the record is saved, while
  // the navigation away is still in flight. A click in that gap saved a
  // duplicate.
  const submitLock = useSubmitLock();
  const saveAsDraftRef = useRef(false);
  const { chemicals, isLoading: isLoadingChemicals } = useChemicalNamesQuery();
  const { items: sdsRecords, isLoading: isLoadingSdsRecords } = useSdsListQuery(
    { pageSize: SDS_LIST_PAGE_SIZE },
  );
  const [lockedFields, setLockedFields] = useState<ReadonlySet<string>>(
    new Set(),
  );

  // Chemical:SDS is 1:1 — once a chemical has an SDS on file, it can't take
  // another, so don't offer it here.
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
        .filter((chemical) => !chemicalIdsWithSds.has(chemical.id))
        .map((chemical) => ({
          value: String(chemical.id),
          label: chemical.name,
        })),
    [chemicals, chemicalIdsWithSds],
  );

  /**
   * `GET /chemicals/names` (the dropdown's own source) only carries
   * `{ id, name }` — the richer fields autofilled here (CAS #, hazard class,
   * dispose location, signal word, pictograms) need the chemical's full
   * detail, so it's fetched on selection rather than pre-loaded for every
   * option in the list.
   */
  const handleChemicalChange = (
    chemicalId: string,
    patchValues: (patch: FormValues) => void,
  ) => {
    const id = Number(chemicalId);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    void queryClient
      .fetchQuery({
        queryKey: hazcomQueryKeys.chemical(id),
        queryFn: async () => {
          const response = await getChemicalById(id);
          return response.dataModel === null
            ? null
            : mapChemicalDtoToHazcomChemical(response.dataModel);
        },
      })
      .then((chemical) => {
        if (!chemical) {
          return;
        }

        const patch: FormValues = {};
        if (chemical.name) patch.productName = chemical.name;
        if (chemical.casNumber) patch.casNumber = chemical.casNumber;
        if (chemical.hazardClass) patch.hazardClass = chemical.hazardClass;
        if (chemical.disposeLocation) {
          patch.disposeLocation = chemical.disposeLocation;
        }
        if (chemical.signalWord) patch.signalWord = chemical.signalWord;
        if (chemical.pictograms.length > 0) {
          patch.ghsPictograms = [...chemical.pictograms];
        }
        // The chemical's hazard/precautionary statements are themselves
        // joined in from its latest SDS on file — carrying them back onto a
        // new SDS record for the same chemical is the other half of that
        // relationship, a starting draft the uploader can still edit.
        if (chemical.hazardStatements.length > 0) {
          patch.hazardStatement = chemical.hazardStatements
            .map((statement) => statement.code)
            .join(", ");
        }
        if (chemical.precautionaryStatements.length > 0) {
          patch.precautionaryStatement = chemical.precautionaryStatements
            .map((statement) => statement.code)
            .join(", ");
        }

        if (Object.keys(patch).length > 0) {
          patchValues(patch);
          // Locks for the rest of the session — a picked chemical is the
          // source of truth for these fields, so a mistyped edit can't
          // silently drift from the record it came from.
          setLockedFields(
            (current) => new Set([...current, ...Object.keys(patch)]),
          );
        }
      })
      .catch(() => {
        // Silent: autofill is a convenience, not required to submit the form.
      });
  };

  const isLoadingChemicalOptions = isLoadingChemicals || isLoadingSdsRecords;

  const schema = useMemo(
    () =>
      buildSdsUploadSchema({
        chemicalOptions: isLoadingChemicalOptions
          ? [{ value: "", label: "Loading chemicals…" }]
          : chemicalOptions,
        onChemicalChange: handleChemicalChange,
        lockedFields,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleChemicalChange is stable enough (queryClient identity doesn't change) and including it would rebuild the schema (and reset field focus) on every render.
    [chemicalOptions, isLoadingChemicalOptions, lockedFields],
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

    if (!submitLock.acquire()) {
      return;
    }

    createSds.mutate(payload, {
      onSuccess: () => {
        toast.success(isDraft ? "SDS saved as draft" : "SDS record saved");
        goBack();
      },
      onError: (error) => {
        submitLock.release();
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

      <div className="border-ehs-border-ink/8 mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-5">
        <Button
          type="button"
          variant="tertiary"
          onClick={goBack}
          disabled={submitLock.isLocked}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold"
        >
          <Icon icon="mdi:arrow-left" className="size-4" aria-hidden />
          Cancel
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={submitLock.isLocked}
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
            isLoading={submitLock.isLocked}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-(--ehs-shadow-button-primary-flat)"
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
