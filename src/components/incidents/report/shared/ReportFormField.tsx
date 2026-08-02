"use client";

import { Icon } from "@iconify/react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Text } from "@/components/Text";
import {
  FIELD_INPUT_CLASS,
  FIELD_SELECT_CLASS,
  FIELD_SELECT_PLACEHOLDER_CLASS,
  FIELD_TEXTAREA_CLASS,
} from "@/components/ui/field-styles";

/** @deprecated Import `FIELD_INPUT_CLASS` from `@/components/ui/field-styles`. */
export const reportFieldInputClass = FIELD_INPUT_CLASS;

const fieldInputClass = FIELD_INPUT_CLASS;

export type ReportFieldLabelProps = Readonly<{
  label: string;
  required?: boolean;
  hint?: string;
  trailing?: ReactNode;
}>;

export function ReportFieldLabel(props: Readonly<ReportFieldLabelProps>) {
  const { label, required = false, hint, trailing } = props;

  return (
    <div className="flex min-h-7 flex-wrap items-end gap-1.5">
      <Text as="span" className="text-[12px] font-bold text-[#2a3446]">
        {label}
      </Text>
      {required ? (
        <Text as="span" className="text-ehs-red text-[12px]">
          *
        </Text>
      ) : null}
      {hint ? (
        <span className="text-ehs-muted-text inline-flex items-center gap-1 text-[10px]">
          <Icon
            icon="mdi:information-outline"
            className="size-3"
            aria-hidden="true"
          />
          {hint}
        </span>
      ) : null}
      {trailing ? <span className="ml-auto">{trailing}</span> : null}
    </div>
  );
}

export type ReportTextFieldProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    label: string;
    required?: boolean;
    helperText?: string;
    trailingHint?: string;
    endIcon?: string;
    className?: string;
  }
>;

export function ReportTextField(props: Readonly<ReportTextFieldProps>) {
  const {
    label,
    required,
    helperText,
    trailingHint,
    endIcon,
    className = "",
    id,
    ...rest
  } = props;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-[10px]">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />
      <div className="relative">
        <input
          id={id}
          className={[fieldInputClass, endIcon ? "pr-9" : ""].join(" ")}
          {...rest}
        />
        {endIcon ? (
          <Icon
            icon={endIcon}
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-[13px] -translate-y-1/2"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {helperText ? (
        <Text as="p" className="text-ehs-muted-text text-[10px]">
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}

export type ReportSelectFieldProps = Readonly<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
    label: string;
    required?: boolean;
    hint?: string;
    trailingHint?: string;
    options: readonly { value: string; label: string }[];
    className?: string;
  }
>;

export function ReportSelectField(props: Readonly<ReportSelectFieldProps>) {
  const {
    label,
    required,
    hint,
    trailingHint,
    options,
    className = "",
    id,
    value,
    ...rest
  } = props;

  const isPlaceholder = value === "" || value === undefined;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        hint={hint}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-[10px]">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />
      <div className="group relative">
        <select
          id={id}
          value={value}
          className={[
            FIELD_SELECT_CLASS,
            isPlaceholder ? FIELD_SELECT_PLACEHOLDER_CLASS : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              // Options render in the OS menu, which ignores the placeholder
              // colour above — so reset it here or every item looks muted.
              className="text-ehs-dark-bg"
            >
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon="mdi:chevron-down"
          className="text-ehs-muted-text group-focus-within:text-ehs-normal-blue pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 transition-colors"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export type ReportTextareaFieldProps = Readonly<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    label: string;
    required?: boolean;
    trailingHint?: string;
    className?: string;
  }
>;

export function ReportTextareaField(props: Readonly<ReportTextareaFieldProps>) {
  const { label, required, trailingHint, className = "", id, ...rest } = props;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-[10px]">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />
      <textarea id={id} className={FIELD_TEXTAREA_CLASS} {...rest} />
    </div>
  );
}
