"use client";

import { Icon } from "@iconify/react";
import { PhotoUploadControl } from "./PhotoUploadControl";
import { SelectWithCustomControl } from "./SelectWithCustomControl";
import type {
  CheckboxGroupFieldConfig,
  DateFieldConfig,
  FieldConfig,
  FieldValue,
  SelectFieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
} from "./types";

const inputClass =
  "p-3 w-full rounded-lg border border-slate-900/10 bg-ehs-light-bg/40 text-base text-ehs-dark-bg outline-none transition placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";

const errorRingClass =
  "border-ehs-red/60 focus:border-ehs-red focus:ring-ehs-red/20";

function FieldLabel(
  props: Readonly<{ label: string; required?: boolean; htmlFor: string }>,
) {
  const { label, required, htmlFor } = props;
  return (
    <label htmlFor={htmlFor} className="text-slate-70 mb-1 font-medium">
      {label}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}

function FieldShell(
  props: Readonly<{
    field: FieldConfig;
    error?: string;
    /** Set false when the control renders its own error/helper text. */
    showMessages?: boolean;
    children: React.ReactNode;
  }>,
) {
  const { field, error, showMessages = true, children } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        label={field.label}
        required={field.required}
        htmlFor={field.name}
      />
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
  return (
    <input
      id={field.name}
      name={field.name}
      type={field.inputType ?? "text"}
      value={value}
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

  if (field.allowCustom) {
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
        onChange={(event) => onChange(event.target.value)}
        className={[
          inputClass,
          "appearance-none pr-9",
          value ? "" : "text-ehs-muted-text",
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
        <FieldShell field={field} error={error}>
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
        <FieldShell field={field} error={error}>
          <TextareaControl
            field={field}
            value={value as string}
            error={error}
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
