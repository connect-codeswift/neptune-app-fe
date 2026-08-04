"use client";

import { useMemo } from "react";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useBehaviorCategoriesQuery } from "@/hooks/use-bbs-queries";
import { toBehaviorCategorySuggestions } from "@/lib/map-bbs";
import { buildObservationTypeSchema } from "./observation-form-schema";

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

  const categoriesQuery = useBehaviorCategoriesQuery();
  const categorySuggestions = useMemo(
    () => toBehaviorCategorySuggestions(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const schema = useMemo(
    () => buildObservationTypeSchema(categorySuggestions),
    [categorySuggestions],
  );

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

      {categoriesQuery.isPending ? (
        <Text as="p" className="text-ehs-muted-text text-sm">
          Loading behavior categories...
        </Text>
      ) : null}

      {categoriesQuery.isError ? (
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            categoriesQuery.error,
            "Could not load behavior categories.",
          )}
        </Text>
      ) : null}

      <FormBuilder
        schema={schema}
        initialValues={initialValues}
        onSubmit={onValidSubmit}
        onChange={onChange}
        formId={formId}
        hideActions
      />
    </div>
  );
}
