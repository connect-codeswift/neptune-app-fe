/**
 * Schema-driven form types for the reusable {@link FormBuilder}.
 *
 * A form is described by an array of {@link FieldConfig} entries. Each field
 * maps to a value in {@link FormValues} keyed by its `name`.
 */

export type SelectOption = Readonly<{ value: string; label: string }>;

/** Every field value is either a string (text/date/select/textarea) or a
 * string[] (checkbox-group of selected option values). */
export type FieldValue = string | string[];

export type FormValues = Record<string, FieldValue>;

export type FormErrors = Record<string, string>;

type BaseField = Readonly<{
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  /** Columns to occupy in the 12-column grid on `sm` screens and up.
   * Defaults to 12 (full width). Ignored below the `sm` breakpoint. */
  colSpan?: number;
}>;

export type TextFieldConfig = BaseField &
  Readonly<{
    type: "text";
    placeholder?: string;
    inputType?: "text" | "email" | "tel" | "number";
  }>;

export type DateFieldConfig = BaseField &
  Readonly<{
    type: "date";
    placeholder?: string;
  }>;

export type SelectFieldConfig = BaseField &
  Readonly<{
    type: "select";
    placeholder?: string;
    options: readonly SelectOption[];
  }>;

export type TextareaFieldConfig = BaseField &
  Readonly<{
    type: "textarea";
    placeholder?: string;
    rows?: number;
  }>;

export type CheckboxGroupFieldConfig = BaseField &
  Readonly<{
    type: "checkbox-group";
    options: readonly SelectOption[];
    /** Number of columns for the option grid on `sm`+. Defaults to 2. */
    columns?: 1 | 2 | 3;
  }>;

export type FieldConfig =
  | TextFieldConfig
  | DateFieldConfig
  | SelectFieldConfig
  | TextareaFieldConfig
  | CheckboxGroupFieldConfig;

export type FormSchema = readonly FieldConfig[];

/** Build the initial (empty) value map for a schema. */
export function createInitialValues(schema: FormSchema): FormValues {
  const values: FormValues = {};
  for (const field of schema) {
    values[field.name] = field.type === "checkbox-group" ? [] : "";
  }
  return values;
}
