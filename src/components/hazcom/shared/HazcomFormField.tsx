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
export const hazcomFieldInputClass = FIELD_INPUT_CLASS;

const fieldInputClass = FIELD_INPUT_CLASS;

/**
 * Sentence-case form labels — `text7` carries the semibold weight so call sites
 * don't need a `font-semibold` override on top of `text8`.
 */
export const HAZCOM_FIELD_LABEL_CLASS = "text7 text-ehs-darker";

type HazcomFieldLabelProps = Readonly<{
  label: string;
  required?: boolean;
  hint?: string;
  trailing?: ReactNode;
}>;

function HazcomFieldLabel(props: Readonly<HazcomFieldLabelProps>) {
  const { label, required = false, hint, trailing } = props;

  return (
    <div className="flex min-h-7 flex-wrap items-end gap-1.5">
      <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
        {label}
      </Text>
      {required ? (
        <Text as="span" className="text8 text-ehs-red">
          *
        </Text>
      ) : null}
      {hint ? (
        <span className="text8 text-ehs-muted-text inline-flex items-center gap-1">
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

export type HazcomTextFieldProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    label: string;
    required?: boolean;
    helperText?: string;
    trailingHint?: string;
    endIcon?: string;
    className?: string;
  }
>;

export function HazcomTextField(props: Readonly<HazcomTextFieldProps>) {
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
      <HazcomFieldLabel
        label={label}
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text8 text-ehs-muted-text">
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
        <Text as="p" className="text8 text-ehs-muted-text">
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}

export type HazcomSelectFieldProps = Readonly<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
    label: string;
    required?: boolean;
    hint?: string;
    trailingHint?: string;
    options: readonly { value: string; label: string }[];
    className?: string;
  }
>;

export function HazcomSelectField(props: Readonly<HazcomSelectFieldProps>) {
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
      <HazcomFieldLabel
        label={label}
        required={required}
        hint={hint}
        trailing={
          trailingHint ? (
            <Text as="span" className="text8 text-ehs-muted-text">
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

export type HazcomTextareaFieldProps = Readonly<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    label: string;
    required?: boolean;
    trailingHint?: string;
    className?: string;
  }
>;

export function HazcomTextareaField(props: Readonly<HazcomTextareaFieldProps>) {
  const { label, required, trailingHint, className = "", id, ...rest } = props;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <HazcomFieldLabel
        label={label}
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text8 text-ehs-muted-text">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />
      <textarea id={id} className={FIELD_TEXTAREA_CLASS} {...rest} />
    </div>
  );
}
