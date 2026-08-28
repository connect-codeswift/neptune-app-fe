"use client";

import { cantBeFuture, cantBePast } from "@/lib/date-time-field";
import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { FieldRenderer } from "./FormBuilderFields";
import {
  createInitialValues,
  dateFieldMax,
  dateFieldMin,
  type DateFieldConfig,
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
  "relative overflow-hidden rounded-2xl border border-ehs-hairline/90 bg-ehs-surface/62 px-5.25 pt-5.25 pb-5 shadow-(--ehs-shadow-panel) backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:col-span-12";

function isEmpty(value: FieldValue): boolean {
  return Array.isArray(value) ? value.length === 0 : value.trim() === "";
}

/**
 * Message for a date outside its bounds, or `null` when it is in range.
 *
 * `min` / `max` on the input only grey the calendar out — the form is
 * `noValidate`, and every browser still lets a typed or pasted value through —
 * so submit is where an out-of-range date is actually caught. ISO `YYYY-MM-DD`
 * sorts chronologically as text, which is why these compare as strings.
 */
function dateRangeError(field: DateFieldConfig, value: string): string | null {
  const selected = value.trim();
  if (selected === "") return null;

  if (field.limit === "not-past") {
    return cantBePast(selected, field.label).error;
  }

  if (field.limit === "not-future") {
    return cantBeFuture(selected, field.label).error;
  }

  const min = dateFieldMin(field);
  if (min && selected < min) {
    return `${field.label} cannot be before ${min}`;
  }

  const max = dateFieldMax(field);
  if (max && selected > max) {
    return `${field.label} cannot be after ${max}`;
  }

  return null;
}

/** Validate required fields and date bounds; returns an error map (empty when valid). */
function validate(schema: FormSchema, values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const field of schema) {
    // Neither holds a value: headings are decoration, and a custom field's
    // node owns its own value and error outside the form.
    if (field.type === "heading" || field.type === "custom") continue;

    // Before the required check, because the bound applies to optional dates
    // too: leaving a due date blank is allowed, back-dating it is not.
    if (field.type === "date") {
      const raw = values[field.name];
      const message = dateRangeError(field, typeof raw === "string" ? raw : "");
      if (message) {
        errors[field.name] = message;
        continue;
      }
    }

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

    // A date input only ever hands back a complete value — a half-typed one
    // reads as "" — so an out-of-range date is worth flagging the moment it is
    // entered rather than holding it back until submit. Every other field only
    // clears here: arguing with half-written text is what makes live validation
    // hostile, and a date has no half-written state to argue with.
    const edited = schema.find((entry) => entry.name === name);
    const dateError =
      edited?.type === "date" && typeof value === "string"
        ? dateRangeError(edited, value)
        : null;

    setErrors((prev) => {
      if (dateError) return { ...prev, [name]: dateError };
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
              ? "shadow-(--ehs-shadow-button-primary-flat)"
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
