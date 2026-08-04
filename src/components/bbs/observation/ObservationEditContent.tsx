"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";
import type { ObservationDetail } from "@/app/dashboard/bbs/bbs-data";
import {
  observationInfoSchema,
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
  return <h2 className="text-ehs-dark-bg text-xl font-bold">{children}</h2>;
}

export type ObservationEditContentProps = Readonly<{
  detail: ObservationDetail;
}>;

export function ObservationEditContent(props: ObservationEditContentProps) {
  const { detail } = props;
  const router = useRouter();

  // Latest field values, kept in a ref so submit handlers never read stale state.
  const valuesRef = useRef<FormValues | null>(null);
  if (valuesRef.current === null) {
    valuesRef.current = toObservationEditValues(detail);
  }
  const [values, setValues] = useState<FormValues>(() =>
    toObservationEditValues(detail),
  );

  const updateValues = (next: FormValues) => {
    valuesRef.current = next;
    setValues(next);
  };

  const detailRoute = `${BBS_ROUTE}/observation?id=${encodeURIComponent(detail.id)}`;

  /** Tracks how many of the forms validated, so Save runs once, only when all pass. */
  const validatedCountRef = useRef(0);

  const persistObservation = () => {
    // TODO: wire to PUT /api/bbs/observations/{id} once the payload is agreed.
    toast.success("Observation updated");
    router.push(detailRoute);
  };

  /** Shared handler: each form calls this after it passes validation. */
  const handleFormValid = () => {
    validatedCountRef.current += 1;
    if (validatedCountRef.current >= FORMS_TO_VALIDATE) {
      validatedCountRef.current = 0;
      persistObservation();
    }
  };

  const saveAll = () => {
    validatedCountRef.current = 0;
    for (const id of [INFO_FORM_ID, DETAILS_FORM_ID, PHOTOS_FORM_ID]) {
      const form = document.getElementById(id);
      if (form instanceof HTMLFormElement) form.requestSubmit();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-8">
      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
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

          <Text
            as="h1"
            className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
          >
            {`Edit ${detail.id} Observation`}
          </Text>
        </div>
      </div>

      {/* Observation Information */}
      <IncidentGlassCard
        paddingClassName="p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-4"
      >
        <SectionTitle>Observation Information</SectionTitle>
        <FormBuilder
          schema={observationInfoSchema}
          initialValues={values}
          formId={INFO_FORM_ID}
          hideActions
          onChange={updateValues}
          onSubmit={handleFormValid}
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
            "[&_input]:text-[13px]",
            "[&_select]:h-10",
            "[&_select]:bg-white/80",
            "[&_select]:px-3",
            "[&_select]:py-0",
            "[&_select]:text-[13px]",
          ].join(" ")}
        />
      </IncidentGlassCard>

      {/* Behavior Details */}
      <IncidentGlassCard
        paddingClassName="p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-4"
      >
        <SectionTitle>Behavior Details</SectionTitle>
        <FormBuilder
          schema={observationDetailsSchema}
          initialValues={values}
          formId={DETAILS_FORM_ID}
          hideActions
          onChange={updateValues}
          onSubmit={handleFormValid}
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
            "[&_textarea]:text-[13px]",
          ].join(" ")}
        />
      </IncidentGlassCard>

      {/* Photo Evidence — same photo field as the log observation flow. */}
      <IncidentGlassCard
        paddingClassName="p-5"
        className="min-w-0"
        incidentGlassCardClassName="gap-4"
      >
        <SectionTitle>Photo Evidence</SectionTitle>
        <FormBuilder
          schema={observationPhotosSchema}
          initialValues={values}
          formId={PHOTOS_FORM_ID}
          hideActions
          onChange={updateValues}
          onSubmit={handleFormValid}
          className="gap-4 [&_label]:hidden"
        />
      </IncidentGlassCard>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="tertiary"
          onClick={() => router.push(detailRoute)}
          className="text-ehs-gray rounded-lg border border-slate-900/8 bg-white/40 px-5 py-2.5 text-[13px] font-bold"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={saveAll}
          className="shrink-0 rounded-lg px-6 py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
