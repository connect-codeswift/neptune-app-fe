"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";

export type FieldLabelProps = Readonly<{
  label: string;
  required?: boolean;
  trailing?: ReactNode;
}>;

export function FieldLabel(props: Readonly<FieldLabelProps>) {
  const { label, required = false, trailing } = props;

  return (
    <div className="flex min-h-7 flex-wrap items-end gap-1.5">
      <Text as="span" className="text-ehs-slate text-sm font-bold">
        {label}
      </Text>
      {required ? (
        <Text as="span" className="text-ehs-red text-sm">
          *
        </Text>
      ) : null}
      {trailing ? <span className="ml-auto">{trailing}</span> : null}
    </div>
  );
}

export type FieldHintProps = Readonly<{
  children: ReactNode;
  /** Shows the ⓘ glyph — for hints that explain a value the form set for you. */
  withIcon?: boolean;
}>;

/**
 * Helper text under a field. It lives below the control rather than beside the
 * label: next to the label it competed with the field name for the same line,
 * wrapped in narrow grid columns, and pushed the input out of line with its
 * neighbour.
 */
export function FieldHint(props: Readonly<FieldHintProps>) {
  const { children, withIcon = false } = props;

  // A plain <p>, like FieldError: Text only accepts string children and
  // this one carries the optional glyph alongside the text.
  return (
    <p className="text-ehs-muted-text inline-flex items-center gap-1 text-xs">
      {withIcon ? (
        <Icon
          icon="mdi:information-outline"
          className="size-3 shrink-0"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </p>
  );
}

export type FieldErrorProps = Readonly<{
  id?: string;
  children: string;
}>;

/**
 * Inline validation message under a field. Pair it with `aria-invalid` and an
 * `aria-describedby` pointing at this `id` — the red text alone says nothing to
 * a screen reader, and `FIELD_BASE` already styles the border off `aria-invalid`.
 */
export function FieldError(props: Readonly<FieldErrorProps>) {
  const { id, children } = props;

  return (
    <p id={id} className="text-ehs-red min-w-0 text-xs">
      {children}
    </p>
  );
}
