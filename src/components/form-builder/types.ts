import type { ReactNode } from "react";
import type { FileModule } from "@/dtos/req/files-request.dto";

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
  /** Append a muted "(optional)" beside the label when the field is not required. */
  showOptional?: boolean;
  /** Custom hint beside the label (overrides the default "(optional)" text). */
  optionalHint?: string;
  /** Extra classes for {@link optionalHint} / showOptional text. */
  optionalHintClassName?: string;
  /** Columns to occupy in the 12-column grid on `sm` screens and up.
   * Defaults to 12 (full width). Ignored below the `sm` breakpoint. */
  colSpan?: number;
  /**
   * Wrap the field in a glass card with a section-style label
   * (e.g. CAPA verification checklist / notes).
   */
  card?: boolean;
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
    /**
     * Ready-made values offered from a round add button beside the input.
     * The field stays free-text; picking one just fills it in.
     */
    suggestions?: readonly string[];
  }>;

export type DateFieldConfig = BaseField &
  Readonly<{
    type: "date";
    placeholder?: string;
  }>;

export type TimeFieldConfig = BaseField &
  Readonly<{
    type: "time";
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
    /** Render the control read-only — the value is fixed by the caller. */
    disabled?: boolean;
    /**
     * "search" swaps the chevron trigger for a round add button, so the field
     * reads as a search box that opens its menu from the button.
     */
    variant?: "default" | "search";
  }>;

/** What a textarea hands its assistant so the assistant can write back. */
export type TextareaAssistantField = Readonly<{
  value: string;
  onChange: (next: string) => void;
}>;

export type TextareaFieldConfig = BaseField &
  Readonly<{
    type: "textarea";
    placeholder?: string;
    rows?: number;
    /** Caps input length and shows a "0/500" counter beside the label. */
    maxLength?: number;
    /**
     * Controls layered inside the field box — the AI rewrite buttons and the
     * ghost draft.
     *
     * A render prop rather than a node, because both need to read and write
     * this field: accepting a draft and applying a rewrite are writes.
     * `FormBuilder` owns its values in local state, so handing the field's own
     * `value` and `onChange` down is what avoids either a controlled mode or an
     * imperative handle just to let the assistant type into the box.
     *
     * Same box contract as `ReportTextareaField` in the incident wizard: the
     * textarea gains a `relative` wrapper and a reserved strip along the bottom
     * so typed text never runs under the buttons.
     */
    assistant?: (field: TextareaAssistantField) => ReactNode;
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
    /**
     * "grid" (default) = compact option grid.
     * "rows" = full-width Figma checklist rows.
     */
    variant?: "grid" | "rows";
    /** When true with `required`, every option must be selected. */
    requireAll?: boolean;
  }>;

/** Image / file upload field. Default storage is files-API `fileId`s;
 * `storage: "cloudinary"` stores the Cloudinary secure URL instead. */
export type PhotoFieldConfig = BaseField &
  Readonly<{
    type: "photo";
    /** Headline shown inside the drop zone. */
    placeholder?: string;
    /** Maximum number of files. Defaults to {@link FILE_MAX_FILES}. */
    maxFiles?: number;
    /**
     * `image` (default) = photos only, thumbnail grid.
     * `files` = images + PDF/DOC, Figma-style row list.
     * `pdf` = PDF only (SDS sheets).
     */
    accept?: "image" | "files" | "pdf";
    /** List presentation. Defaults to `grid` for images, `rows` for files. */
    listVariant?: "grid" | "rows";
    /** Hide the field label (e.g. tab already titles the section). */
    hideLabel?: boolean;
    /** Override the module size limit for this field. */
    maxBytes?: number;
    /** Files API module. Defaults to `Document`. Ignored when {@link storage} is `cloudinary`. */
    fileModule?: FileModule;
    /**
     * `files` (default) = POST /api/files/upload-intent.
     * `cloudinary` = unsigned client upload; the field value is the secure URL.
     */
    storage?: "files" | "cloudinary";
  }>;

/** Colour family for a tile — drives its tint, border and icon. */
export type TileTone = "positive" | "warning" | "neutral";

export type TileOption = Readonly<{
  value: string;
  label: string;
  /** Supporting line under the label. */
  description?: string;
  /** Iconify name rendered above the label. */
  icon?: string;
  tone?: TileTone;
}>;

/** Single-choice picker rendered as large tappable cards rather than a select. */
export type TilesFieldConfig = BaseField &
  Readonly<{
    type: "tiles";
    options: readonly TileOption[];
    /** Number of columns on `sm`+. Defaults to 2. */
    columns?: 1 | 2 | 3;
    /** Drop the field label when a surrounding header already asks the question. */
    hideLabel?: boolean;
    /**
     * "cards" (default) = tall icon cards.
     * "segmented" = compact equal-width toggle buttons (dot + label).
     * "segmented-fill" = Figma priority group: muted track, solid teal selected.
     * "assessment" = large equal cards (CAPA effectiveness).
     */
    variant?: "cards" | "segmented" | "segmented-fill" | "assessment";
  }>;

/** Boolean toggle stored as `"true"` / `"false"` string values. */
export type SwitchFieldConfig = BaseField &
  Readonly<{
    type: "switch";
  }>;

/** Non-input section title spanning the form grid (no stored value). */
export type HeadingFieldConfig = BaseField &
  Readonly<{
    type: "heading";
  }>;

/**
 * Site roster person picker (search + avatar list).
 * Field value is the selected user id. Display name is kept in
 * {@link displayNameField} (defaults to `${name}Name`).
 */
export type PersonFieldConfig = BaseField &
  Readonly<{
    type: "person";
    placeholder?: string;
    /** Hint opposite the label, e.g. "Search people at your site." */
    trailingHint?: string;
    /**
     * Where the picker loads people from.
     * - `site` (default): GET /api/v1/sites/{siteId}/users
     * - `dropdown`: GET /api/v1/users/dropdown (client-filtered)
     */
    usersSource?: "site" | "dropdown";
    /** Site whose roster is searched when `usersSource` is `site`. `0` disables. */
    siteId?: number;
    siteName?: string | null;
    /** Form value key for the display name. Defaults to `${name}Name`. */
    displayNameField?: string;
    /** Lock the control — show the current display name, no search. */
    disabled?: boolean;
  }>;

export type FieldConfig =
  | TextFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | SelectFieldConfig
  | TextareaFieldConfig
  | CheckboxGroupFieldConfig
  | ChipsFieldConfig
  | PhotoFieldConfig
  | TilesFieldConfig
  | SwitchFieldConfig
  | HeadingFieldConfig
  | PersonFieldConfig;

export type FormSchema = readonly FieldConfig[];

/** Build the initial (empty) value map for a schema. */
export function createInitialValues(schema: FormSchema): FormValues {
  const values: FormValues = {};
  for (const field of schema) {
    if (field.type === "heading") continue;

    const isMultiValue =
      field.type === "checkbox-group" ||
      field.type === "photo" ||
      field.type === "chips";

    if (field.type === "switch") {
      values[field.name] = "false";
      continue;
    }

    values[field.name] = isMultiValue ? [] : "";
  }
  return values;
}
