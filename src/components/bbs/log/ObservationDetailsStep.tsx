"use client";

import { FormBuilder, type FormValues } from "@/components/form-builder";
import { observationDetailsSchema } from "./observation-form-schema";

export type ObservationDetailsStepProps = Readonly<{
  /** Seeded with the values already collected for step 2. */
  initialValues: FormValues;
  /** Called with the validated values when the "Review" button submits. */
  onValidSubmit: (values: FormValues) => void;
  /** Mirrors the form as the user types, for restoring on revisit. */
  onChange?: (values: FormValues) => void;
  /** Id of the underlying <form>, targeted by the external Review button. */
  formId: string;
}>;

export function ObservationDetailsStep(props: ObservationDetailsStepProps) {
  const { initialValues, onValidSubmit, onChange, formId } = props;

  return (
    <div className="flex flex-col gap-1">
      <header className="mb-3 flex flex-col gap-1">
        <h2 className="text-ehs-dark-bg text-lg font-bold">
          Where &amp; What happened?
        </h2>
        <p className="text-ehs-muted-text text-sm">
          Tell us where the behavior occurred and describe what you saw
        </p>
      </header>

      <FormBuilder
        schema={observationDetailsSchema}
        initialValues={initialValues}
        onSubmit={onValidSubmit}
        onChange={onChange}
        formId={formId}
        hideActions
      />
    </div>
  );
}
