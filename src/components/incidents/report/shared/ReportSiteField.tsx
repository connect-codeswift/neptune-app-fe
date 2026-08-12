"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  ReportFieldLabel,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";

export type ReportSiteFieldProps = Readonly<{
  label: string;
  required?: boolean;
  /** The form's current value — the site name once it has been stamped in. */
  value: string;
  /** Used only by the manual fallback, when there is no site to stamp. */
  onChange: (value: string) => void;
  siteName: string | null;
  isLoading: boolean;
  className?: string;
}>;

/**
 * Plant / Location, taken from the site the reporter is signed in to rather
 * than asked for.
 *
 * It was a free-text type-ahead, which meant the same plant arrived spelled
 * three ways and an incident could be filed against a site the reporter has no
 * access to. The site is already known — it scopes the whole dashboard — so
 * this displays it and stays out of the way.
 *
 * The fallback matters as much as the happy path: if the session never names a
 * site, this degrades to the plain text field it replaced instead of leaving a
 * required field the reporter cannot fill.
 */
export function ReportSiteField(props: Readonly<ReportSiteFieldProps>) {
  const {
    label,
    required = false,
    value,
    onChange,
    siteName,
    isLoading,
    className = "",
  } = props;

  if (isLoading) {
    return (
      <div
        className={["flex flex-col gap-1.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        <ReportFieldLabel label={label} required={required} />
        <div className="h-9 animate-pulse rounded-2.5 bg-[rgba(15,23,42,0.06)]" />
      </div>
    );
  }

  if (!siteName) {
    return (
      <ReportTextField
        label={label}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        trailingHint="No site on your sign-in — enter it manually."
        endIcon="mdi:map-marker-outline"
        placeholder="Plant A · Line 2 — Press #4"
        className={className}
      />
    );
  }

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        trailing={
          <Text as="span" className="text-ehs-muted-text text-xs">
            Auto-assigned from your site.
          </Text>
        }
      />

      <div
        className={[
          FIELD_INPUT_CLASS,
          // Not a disabled input: this is a settled fact, not a control that
          // happens to be switched off, and dimmed text would read as broken.
          "flex cursor-default items-center gap-2 hover:border-[rgba(15,23,42,0.08)] hover:bg-white/[0.62]",
        ].join(" ")}
      >
        <Icon
          icon="mdi:office-building-marker-outline"
          className="text-ehs-dark-blue size-4 shrink-0"
          aria-hidden="true"
        />
        <span className="text-ehs-dark-bg min-w-0 flex-1 truncate font-medium">
          {siteName}
        </span>
        <span className="bg-ehs-light-blue text-ehs-dark-blue inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-px text-2.5 font-semibold">
          <Icon icon="mdi:lock-outline" className="size-3" aria-hidden="true" />
          Auto
        </span>
      </div>
    </div>
  );
}
