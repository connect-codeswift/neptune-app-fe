"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import { PhotoUploadControl } from "./PhotoUploadControl";
import { SelectWithCustomControl } from "./SelectWithCustomControl";
import type {
  CheckboxGroupFieldConfig,
  ChipsFieldConfig,
  DateFieldConfig,
  FieldConfig,
  FieldValue,
  SelectFieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
} from "./types";

const inputClass = FIELD_INPUT_LG_CLASS;

const errorRingClass =
  "border-ehs-red/60 focus:border-ehs-red focus:ring-ehs-red/20";

function FieldLabel(
  props: Readonly<{ label: string; required?: boolean; htmlFor: string }>,
) {
  const { label, required, htmlFor } = props;
  return (
    <label htmlFor={htmlFor} className="text-slate-70 font-medium">
      {label}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}

/** "12/100" counter shown beside the label of a length-capped field. */
function CharacterCount(props: Readonly<{ value: string; maxLength: number }>) {
  const { value, maxLength } = props;

  return (
    <span className="text-ehs-muted-text text-xs tabular-nums">
      {`${String(value.length)}/${String(maxLength)}`}
    </span>
  );
}

function FieldShell(
  props: Readonly<{
    field: FieldConfig;
    error?: string;
    /** Set false when the control renders its own error/helper text. */
    showMessages?: boolean;
    /** Rendered opposite the label, e.g. a character counter. */
    trailing?: React.ReactNode;
    children: React.ReactNode;
  }>,
) {
  const { field, error, showMessages = true, trailing, children } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <FieldLabel
          label={field.label}
          required={field.required}
          htmlFor={field.name}
        />
        {trailing}
      </div>
      {children}
      {!showMessages ? null : error ? (
        <p className="text-ehs-red text-xs">{error}</p>
      ) : field.helperText ? (
        <p className="text-ehs-muted-text text-xs">{field.helperText}</p>
      ) : null}
    </div>
  );
}

export type FieldRendererProps = Readonly<{
  field: FieldConfig;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}>;

function TextControl(
  props: Readonly<{
    field: TextFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;

  if (field.readOnly) {
    return (
      <div
        id={field.name}
        className={[inputClass, "text-ehs-gray flex items-center gap-2"].join(
          " ",
        )}
      >
        <span>{value}</span>
        {field.note ? (
          <span className="text-ehs-muted-text text-xs">{field.note}</span>
        ) : null}
        {/* Keeps the value in the DOM for native form semantics. */}
        <input type="hidden" name={field.name} value={value} />
      </div>
    );
  }

  return (
    <input
      id={field.name}
      name={field.name}
      type={field.inputType ?? "text"}
      value={value}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={[inputClass, error ? errorRingClass : ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function DateControl(
  props: Readonly<{
    field: DateFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;
  return (
    <input
      id={field.name}
      name={field.name}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={[inputClass, error ? errorRingClass : ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function SelectControl(
  props: Readonly<{
    field: SelectFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;

  // A native <select> can't render a footer, so the custom listbox also backs
  // paginated option lists (prev/next controls live in that footer). A disabled
  // field has nothing to pick, so it always falls through to the native one.
  if (!field.disabled && (field.allowCustom || field.pagination)) {
    return (
      <SelectWithCustomControl
        field={field}
        value={value}
        invalid={Boolean(error)}
        onChange={onChange}
        triggerClassName={[inputClass, error ? errorRingClass : ""]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <div className="relative">
      <select
        id={field.name}
        name={field.name}
        value={value}
        disabled={field.disabled}
        onChange={(event) => onChange(event.target.value)}
        className={[
          inputClass,
          "appearance-none pr-9",
          value ? "" : "text-ehs-muted-text",
          field.disabled ? "cursor-not-allowed opacity-70" : "",
          error ? errorRingClass : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {field.placeholder ? (
          <option value="" disabled>
            {field.placeholder}
          </option>
        ) : null}
        {field.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-ehs-dark-bg"
          >
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        icon="mdi:chevron-down"
        className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}

function TextareaControl(
  props: Readonly<{
    field: TextareaFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;
  return (
    <textarea
      id={field.name}
      name={field.name}
      value={value}
      rows={field.rows ?? 4}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={[
        "bg-ehs-light-bg/40 text-ehs-dark-bg placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full resize-y rounded-[10px] border border-slate-900/10 px-3 py-2.5 text-base leading-6 transition outline-none focus:ring-2",
        error ? errorRingClass : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function ChipsControl(
  props: Readonly<{
    field: ChipsFieldConfig;
    value: string[];
    onChange: (v: string[]) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const [draft, setDraft] = useState("");

  // Custom tags aren't in `options`, so surface them alongside the presets.
  const optionValues = new Set(field.options.map((option) => option.value));
  const customTags = value.filter((tag) => !optionValues.has(tag));
  const chips = [
    ...field.options,
    ...customTags.map((tag) => ({ value: tag, label: tag })),
  ];

  const toggle = (tag: string) => {
    onChange(
      value.includes(tag)
        ? value.filter((entry) => entry !== tag)
        : [...value, tag],
    );
  };

  const addDraft = () => {
    const tag = draft.trim();
    if (tag === "") return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(option.value)}
              className={[
                "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-dark-blue font-semibold"
                  : "text-ehs-gray border-slate-900/10 bg-white hover:bg-black/5",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {field.allowCustom ? (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            placeholder={field.addCustomPlaceholder ?? "Add custom tag..."}
            aria-label={`Add a custom ${field.label}`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addDraft();
              }
            }}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={draft.trim() === ""}
            className="bg-ehs-normal-blue/15 text-ehs-dark-blue hover:bg-ehs-normal-blue/25 shrink-0 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}

const checkboxColumnsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

function CheckboxGroupControl(
  props: Readonly<{
    field: CheckboxGroupFieldConfig;
    value: string[];
    onChange: (v: string[]) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const columns = checkboxColumnsClass[field.columns ?? 2];

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div className={["grid grid-cols-1 gap-2", columns].join(" ")}>
      {field.options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label
            key={option.value}
            className="bg-ehs-light-bg/40 flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2"
          >
            <input
              type="checkbox"
              name={field.name}
              value={option.value}
              checked={checked}
              onChange={() => toggle(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={[
                "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                checked
                  ? "border-ehs-normal-blue bg-ehs-normal-blue text-white"
                  : "border-slate-900/20 bg-white/70",
              ].join(" ")}
            >
              {checked ? <Icon icon="mdi:check" className="size-3" /> : null}
            </span>
            <span className="text-base font-medium text-slate-700">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function FieldRenderer(props: FieldRendererProps) {
  const { field, value, error, onChange } = props;

  switch (field.type) {
    case "text":
      return (
        <FieldShell
          field={field}
          error={error}
          trailing={
            field.maxLength ? (
              <CharacterCount
                value={value as string}
                maxLength={field.maxLength}
              />
            ) : null
          }
        >
          <TextControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "date":
      return (
        <FieldShell field={field} error={error}>
          <DateControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "select":
      return (
        <FieldShell field={field} error={error}>
          <SelectControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "textarea":
      return (
        <FieldShell
          field={field}
          error={error}
          trailing={
            field.maxLength ? (
              <CharacterCount
                value={value as string}
                maxLength={field.maxLength}
              />
            ) : null
          }
        >
          <TextareaControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "chips":
      return (
        <FieldShell field={field} error={error}>
          <ChipsControl
            field={field}
            value={value as string[]}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "photo":
      return (
        <FieldShell field={field} error={error} showMessages={false}>
          <PhotoUploadControl
            field={field}
            value={value as string[]}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "checkbox-group":
      return (
        <FieldShell field={field} error={error}>
          <CheckboxGroupControl
            field={field}
            value={value as string[]}
            onChange={onChange}
          />
        </FieldShell>
      );
    default: {
      // Exhaustiveness guard — a new field type must be handled above.
      const _never: never = field;
      return _never;
    }
  }
}
