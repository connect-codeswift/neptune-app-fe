"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  FormBuilder,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useUpdateBbsObservationMutation } from "@/hooks/use-bbs-mutations";
import {
  toBbsObservationApiId,
  useBbsObservationDetailQuery,
  useBehaviorCategoriesQuery,
} from "@/hooks/use-bbs-queries";
import {
  toObservationDetail,
  toUpdateBbsObservationRequest,
} from "@/lib/map-bbs";
import { toast } from "@/lib/toast";
import {
  buildObservationInfoSchema,
  observationDetailsSchema,
  observationPhotosSchema,
  toObservationEditValues,
} from "./observation-edit-schema";

const BBS_ROUTE = "/dashboard/bbs";
const INFO_FORM_ID = "observation-info-form";
const DETAILS_FORM_ID = "observation-details-form";
const PHOTOS_FORM_ID = "observation-photos-form";
/** How many forms must validate before Save persists. */
const FORMS_TO_VALIDATE = 3;

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4"
      aria-hidden="true"
    />
  );
}

function SectionTitle(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <h2 className="text-ehs-dark-bg text-base font-bold md:text-xl">
      {children}
    </h2>
  );
}

/** Keep only fields that belong to a given FormBuilder schema. */
function pickSchemaValues(schema: FormSchema, values: FormValues): FormValues {
  const picked: FormValues = {};
  for (const field of schema) {
    const value = values[field.name];
    if (value !== undefined) {
      picked[field.name] = value;
    }
  }
  return picked;
}

export type ObservationEditContentProps = Readonly<{
  /** List/UI id, e.g. `BBS-2` or `2`. */
  observationId: string;
}>;

export function ObservationEditContent(props: ObservationEditContentProps) {
  const { observationId } = props;
  const router = useRouter();
  const apiId = toBbsObservationApiId(observationId);

  const observationQuery = useBbsObservationDetailQuery(observationId);
  const categoriesQuery = useBehaviorCategoriesQuery();
  const updateObservation = useUpdateBbsObservationMutation();

  const apiModel = observationQuery.data?.dataModel ?? null;
  const detail = apiModel ? toObservationDetail(apiModel) : null;

  const editValues = useMemo(
    () => (detail ? toObservationEditValues(detail) : null),
    [detail],
  );

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .filter(
          (category) => category.isActive !== false && category.name.trim(),
        )
        .map((category) => ({
          value: category.name,
          label: category.name,
        })),
    [categoriesQuery.data],
  );

  const infoSchema = useMemo(
    () =>
      buildObservationInfoSchema({
        categoryOptions,
        currentCategory: detail?.category,
        currentLocation: detail?.location,
      }),
    [categoryOptions, detail?.category, detail?.location],
  );

  const displayId = detail?.id ?? observationId;
  const detailRoute = `${BBS_ROUTE}/observation?id=${encodeURIComponent(displayId)}`;

  /** Tracks how many of the forms validated, so Save runs once, only when all pass. */
  const validatedCountRef = useRef(0);
  /** Merged values gathered from each form's successful submit. */
  const gatheredValuesRef = useRef<FormValues>({});

  const persistObservation = (values: FormValues) => {
    if (apiId === null) {
      toast.error("Invalid observation id.");
      return;
    }

    const payload = toUpdateBbsObservationRequest(
      apiId,
      values,
      categoriesQuery.data ?? [],
      apiModel?.behaviorCategoryId,
    );

    if (!payload) {
      toast.error("Select a behavior category from the list.");
      return;
    }

    updateObservation.mutate(payload, {
      onSuccess: () => {
        toast.success("Observation updated");
        router.push(detailRoute);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not update the observation. Please try again.",
          ),
        );
      },
    });
  };

  /** Each form calls this after it passes validation, merging only its fields. */
  const handleFormValid = (schema: FormSchema, submitted: FormValues) => {
    gatheredValuesRef.current = {
      ...gatheredValuesRef.current,
      ...pickSchemaValues(schema, submitted),
    };
    validatedCountRef.current += 1;
    if (validatedCountRef.current >= FORMS_TO_VALIDATE) {
      validatedCountRef.current = 0;
      persistObservation(gatheredValuesRef.current);
    }
  };

  const saveAll = () => {
    if (updateObservation.isPending) return;
    validatedCountRef.current = 0;
    gatheredValuesRef.current = { ...(editValues ?? {}) };
    for (const id of [INFO_FORM_ID, DETAILS_FORM_ID, PHOTOS_FORM_ID]) {
      const form = document.getElementById(id);
      if (form instanceof HTMLFormElement) form.requestSubmit();
    }
  };

  if (observationQuery.isPending && !detail) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">Loading observation…</p>
      </div>
    );
  }

  if ((observationQuery.isError || observationQuery.isSuccess) && !detail) {
    return (
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">
          That observation could not be loaded.
        </p>
        <Link
          href={BBS_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to observations
        </Link>
      </div>
    );
  }

  if (!detail || !editValues || !apiModel) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">Loading observation…</p>
      </div>
    );
  }

  const formKey = `edit-${detail.id}-${apiModel.createdAt}`;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8 md:gap-4">
      {/* Header — compact on mobile */}
      <div className="backdrop-blur-2.5 relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-6 md:py-4">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 overflow-x-auto md:flex"
          >
            <span className="text-ehs-muted-text text-sm font-medium">
              Safety
            </span>
            <Chevron />
            <Link href={BBS_ROUTE} className={crumbClass}>
              Observations
            </Link>
            <Chevron />
            <Link href={detailRoute} className={crumbClass}>
              {detail.id}
            </Link>
            <Chevron />
            <span className="text-ehs-muted-text text-sm font-medium">
              Edit
            </span>
          </nav>

          <div className="flex items-center gap-2 md:block">
            <Link
              href={detailRoute}
              aria-label="Back to observation"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <h1 className="text-ehs-dark-bg min-w-0 truncate text-base font-bold tracking-[-0.2px] md:text-2xl md:font-semibold">
              <span className="md:hidden">{`Edit ${detail.id}`}</span>
              <span className="hidden md:inline">{`Edit ${detail.id} Observation`}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Observation Information */}
      <IncidentGlassCard
        paddingClassName="p-4 md:p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-3 md:gap-4"
      >
        <SectionTitle>Observation Information</SectionTitle>
        <FormBuilder
          key={`${formKey}-info`}
          schema={infoSchema}
          initialValues={editValues}
          formId={INFO_FORM_ID}
          hideActions
          onSubmit={(submitted) => handleFormValid(infoSchema, submitted)}
          className={[
            "gap-4",
            "[&>div]:gap-x-6",
            "[&>div]:gap-y-4",
            "[&_label]:text-sm",
            "[&_label]:font-bold",
            "[&_label]:uppercase",
            "[&_label]:tracking-[0.24px]",
            "[&_label]:text-[#566072]",
            "[&_input]:h-10",
            "[&_input]:bg-white/80",
            "[&_input]:px-3",
            "[&_input]:py-0",
            "[&_input]:text-3.25",
            "[&_select]:h-10",
            "[&_select]:bg-white/80",
            "[&_select]:px-3",
            "[&_select]:py-0",
            "[&_select]:text-3.25",
          ].join(" ")}
        />
      </IncidentGlassCard>

      {/* Behavior Details */}
      <IncidentGlassCard
        paddingClassName="p-4 md:p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-3 md:gap-4"
      >
        <SectionTitle>Behavior Details</SectionTitle>
        <FormBuilder
          key={`${formKey}-details`}
          schema={observationDetailsSchema}
          initialValues={editValues}
          formId={DETAILS_FORM_ID}
          hideActions
          onSubmit={(submitted) =>
            handleFormValid(observationDetailsSchema, submitted)
          }
          className={[
            "gap-4",
            "[&_label]:text-sm",
            "[&_label]:font-bold",
            "[&_label]:uppercase",
            "[&_label]:tracking-[0.24px]",
            "[&_label]:text-[#566072]",
            "[&_textarea]:h-32.5",
            "[&_textarea]:resize-none",
            "[&_textarea]:bg-white/80",
            "[&_textarea]:px-3",
            "[&_textarea]:py-3",
            "[&_textarea]:text-3.25",
          ].join(" ")}
        />
      </IncidentGlassCard>

      {/* Photo Evidence — same photo field as the log observation flow. */}
      <IncidentGlassCard
        paddingClassName="p-4 md:p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-3 md:gap-4"
      >
        <SectionTitle>Photo Evidence</SectionTitle>
        <FormBuilder
          key={`${formKey}-photos`}
          schema={observationPhotosSchema}
          initialValues={editValues}
          formId={PHOTOS_FORM_ID}
          hideActions
          onSubmit={(submitted) =>
            handleFormValid(observationPhotosSchema, submitted)
          }
          className="gap-4 [&_label]:hidden"
        />
      </IncidentGlassCard>

      {/* Footer — full-width on mobile */}
      <div className="flex items-center gap-3 pt-1 md:justify-between md:pt-2">
        <Button
          type="button"
          variant="tertiary"
          onClick={() => router.push(detailRoute)}
          className="text-ehs-gray text-3.25 h-11 flex-1 rounded-xl border border-slate-900/8 bg-white/40 px-4 py-2.5 font-bold md:h-auto md:flex-none md:rounded-lg md:px-5"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="primary"
          isLoading={updateObservation.isPending}
          onClick={saveAll}
          className="text-3.25 h-11 flex-1 rounded-xl px-4 py-2.5 font-bold shadow-[0px_6px_18px_-6px_#0891a6] md:h-auto md:flex-none md:rounded-lg md:px-6"
        >
          {updateObservation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
