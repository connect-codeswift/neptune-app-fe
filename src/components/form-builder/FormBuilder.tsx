"use client";

import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { FieldRenderer } from "./FormBuilderFields";
import {
  createInitialValues,
  type FieldValue,
  type FormErrors,
  type FormSchema,
  type FormValues,
} from "./types";

export type FormBuilderProps = Readonly<{
  schema: FormSchema;
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  /** Variant for the submit button. Defaults to "primary". */
  submitVariant?: ButtonProps["variant"];
  /** Content rendered between the fields and the action row. */
  beforeActions?: ReactNode;
  /** Called with the full value map whenever a field changes, for live
   * previews and the like. The form still owns the state. */
  onChange?: (values: FormValues) => void;
  /** Hide the built-in action row. Pair with {@link formId} so a button
   * elsewhere on the page can submit (and so validate) the form. */
  hideActions?: boolean;
  /** `id` for the underlying `<form>`, letting outside buttons target it. */
  formId?: string;
}>;

// Static class map so Tailwind can see every span variant at build time.
const colSpanClass: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
};

const fieldCardClass =
  "relative overflow-hidden rounded-2xl border border-white/90 bg-white/62 px-5.25 pt-5.25 pb-5 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:col-span-12";

function isEmpty(value: FieldValue): boolean {
  return Array.isArray(value) ? value.length === 0 : value.trim() === "";
}

/** Validate required fields; returns an error map (empty when valid). */
function validate(schema: FormSchema, values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const field of schema) {
    if (field.type === "heading") continue;
    if (!field.required) continue;

    if (field.type === "person") {
      const nameKey = field.displayNameField ?? `${field.name}Name`;
      const userId = values[field.name];
      const displayName = values[nameKey];
      if (isEmpty(userId) && isEmpty(displayName ?? "")) {
        errors[field.name] = `${field.label} is required`;
      }
      continue;
    }

    if (field.type === "checkbox-group" && field.requireAll) {
      const selected = values[field.name];
      const selectedCount = Array.isArray(selected) ? selected.length : 0;
      if (selectedCount < field.options.length) {
        errors[field.name] = `Complete all ${field.label.toLowerCase()} items`;
      }
      continue;
    }

    if (isEmpty(values[field.name])) {
      errors[field.name] = `${field.label} is required`;
    }
  }
  return errors;
}

export function FormBuilder(props: FormBuilderProps) {
  const {
    schema,
    initialValues,
    onSubmit,
    onCancel,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    isSubmitting = false,
    className = "",
    submitVariant = "primary",
    beforeActions,
    onChange,
    hideActions = false,
    formId,
  } = props;

  const [values, setValues] = useState<FormValues>(
    () => initialValues ?? createInitialValues(schema),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const setValue = (name: string, value: FieldValue) => {
    const next = { ...values, [name]: value };
    setValues(next);
    onChange?.(next);

    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const cleared = { ...prev };
      delete cleared[name];
      return cleared;
    });
  };

  const patchValues = (patch: FormValues) => {
    const next = { ...values, ...patch };
    setValues(next);
    onChange?.(next);

    setErrors((prev) => {
      let changed = false;
      const cleared = { ...prev };
      for (const key of Object.keys(patch)) {
        if (cleared[key]) {
          delete cleared[key];
          changed = true;
        }
      }
      return changed ? cleared : prev;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(schema, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit}
      className={["flex flex-col gap-5", className].filter(Boolean).join(" ")}
    >
      <div className="grid grid-cols-1 items-start gap-x-4 gap-y-5 sm:grid-cols-12">
        {schema.map((field) => (
          <div
            key={field.name}
            className={[
              field.card ? fieldCardClass : "",
              field.card ? "" : colSpanClass[field.colSpan ?? 12],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={field.card ? "relative z-1" : undefined}>
              <FieldRenderer
                field={field}
                value={values[field.name] ?? ""}
                values={values}
                error={errors[field.name]}
                onChange={(value) => setValue(field.name, value)}
                onPatchValues={patchValues}
              />
            </div>
          </div>
        ))}
      </div>

      {beforeActions}

      <div
        className={[
          "flex-wrap items-center justify-end gap-3",
          hideActions ? "hidden" : "flex",
        ].join(" ")}
      >
        {onCancel ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={onCancel}
            className="text4 rounded-2.5 px-4 py-2 font-medium"
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type="submit"
          variant={submitVariant}
          isLoading={isSubmitting}
          className={[
            "text4 rounded-2.5 px-5 py-2 font-semibold",
            submitVariant === "primary"
              ? "shadow-[0px_6px_18px_-6px_#0891a6]"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
