/**
 * Schema-driven form types for the reusable {@link FormBuilder}.
 *
 * A form is described by an array of {@link FieldConfig} entries. Each field
 * maps to a value in {@link FormValues} keyed by its `name`.
 */

export type SelectOption = Readonly<{
  value: string;
  label: string;
  /** Optional short code rendered as a badge before the label (e.g. "H201"). */
  code?: string;
}>;

/** Every field value is either a string (text/date/select/textarea) or a
 * string[] (checkbox-group selections, or uploaded photo URLs). */
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
    /** Caps input length and shows a "0/100" counter beside the label. */
    maxLength?: number;
    /** Render the value as an uneditable panel (auto-filled fields). */
    readOnly?: boolean;
    /** Muted note shown beside a read-only value, e.g. "(auto-filled)". */
    note?: string;
  }>;

export type DateFieldConfig = BaseField &
  Readonly<{
    type: "date";
    placeholder?: string;
  }>;

/** Paging controls for an option list fetched one page at a time from an API. */
export type SelectPagination = Readonly<{
  /** 1-based current page. */
  pageNumber: number;
  /** Total number of pages available. */
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  /** True while a page is being fetched — shows a subtle loading hint. */
  isLoading?: boolean;
}>;

export type SelectFieldConfig = BaseField &
  Readonly<{
    type: "select";
    placeholder?: string;
    options: readonly SelectOption[];
    /** Render the richer listbox that lets users append their own option to
     * this field. Custom entries live for the lifetime of the form. */
    allowCustom?: boolean;
    /** Footer action label shown when {@link allowCustom} is set. */
    addCustomLabel?: string;
    /** Placeholder for the custom-entry input opened by that footer action. */
    addCustomPlaceholder?: string;
    /** When set, the listbox renders prev/next paging controls in its footer,
     * for API-backed option lists that arrive one page at a time. */
    pagination?: SelectPagination;
    /** The full option for the current value when it may fall outside the
     * loaded page (so the trigger can still show its label). */
    selectedOption?: SelectOption;
  }>;

export type TextareaFieldConfig = BaseField &
  Readonly<{
    type: "textarea";
    placeholder?: string;
    rows?: number;
    /** Caps input length and shows a "0/500" counter beside the label. */
    maxLength?: number;
  }>;

/** Tag picker: options render as toggleable pills, value is the chosen set. */
export type ChipsFieldConfig = BaseField &
  Readonly<{
    type: "chips";
    options: readonly SelectOption[];
    /** Show an input for appending tags that aren't in {@link options}. */
    allowCustom?: boolean;
    addCustomPlaceholder?: string;
  }>;

export type CheckboxGroupFieldConfig = BaseField &
  Readonly<{
    type: "checkbox-group";
    options: readonly SelectOption[];
    /** Number of columns for the option grid on `sm`+. Defaults to 2. */
    columns?: 1 | 2 | 3;
  }>;

/** Image upload field. Files go straight to Cloudinary and the field value is
 * the list of resulting secure URLs. */
export type PhotoFieldConfig = BaseField &
  Readonly<{
    type: "photo";
    /** Headline shown inside the drop zone. */
    placeholder?: string;
    /** Maximum number of images. Defaults to {@link CLOUDINARY_MAX_FILES}. */
    maxFiles?: number;
  }>;

export type FieldConfig =
  | TextFieldConfig
  | DateFieldConfig
  | SelectFieldConfig
  | TextareaFieldConfig
  | CheckboxGroupFieldConfig
  | ChipsFieldConfig
  | PhotoFieldConfig;

export type FormSchema = readonly FieldConfig[];

/** Build the initial (empty) value map for a schema. */
export function createInitialValues(schema: FormSchema): FormValues {
  const values: FormValues = {};
  for (const field of schema) {
    const isMultiValue =
      field.type === "checkbox-group" ||
      field.type === "photo" ||
      field.type === "chips";

    values[field.name] = isMultiValue ? [] : "";
  }
  return values;
}
