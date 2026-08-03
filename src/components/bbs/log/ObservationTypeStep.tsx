"use client";

import { FormBuilder, type FormValues } from "@/components/form-builder";
import { observationTypeSchema } from "./observation-form-schema";

export type ObservationTypeStepProps = Readonly<{
  /** Seeded with the values already collected for step 1. */
  initialValues: FormValues;
  /** Called with the validated values when the "Continue" button submits. */
  onValidSubmit: (values: FormValues) => void;
  /** Mirrors the form as the user types, for restoring on revisit. */
  onChange?: (values: FormValues) => void;
  /** Id of the underlying <form>, targeted by the external Continue button. */
  formId: string;
}>;

export function ObservationTypeStep(props: ObservationTypeStepProps) {
  const { initialValues, onValidSubmit, onChange, formId } = props;

  return (
    <div className="flex flex-col gap-1">
      <header className="mb-3 flex flex-col gap-1">
        <h2 className="text-ehs-dark-bg text-lg font-bold">
          What did you observe?
        </h2>
        <p className="text-ehs-muted-text text-sm">
          Select the type of behavior you witnessed
        </p>
      </header>

      <FormBuilder
        schema={observationTypeSchema}
        initialValues={initialValues}
        onSubmit={onValidSubmit}
        onChange={onChange}
        formId={formId}
        hideActions
      />
    </div>
  );
}
