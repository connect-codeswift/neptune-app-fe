"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";
import { Text } from "@/components/Text";
import {
  ReportFieldError,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import {
  formatHhMmAs12Hour,
  maskHhMm,
  normalizeHhMm,
  nowHhMm,
  parseTimeInput,
} from "@/components/incidents/report/shared/report-date-time";

export type ReportTimeFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Offer a "Now" shortcut. Off for times that can't sensibly be the present. */
  showNow?: boolean;
  error?: string | null;
}>;

export function ReportTimeField(props: Readonly<ReportTimeFieldProps>) {
  const {
    label,
    value,
    onChange,
    required,
    placeholder = "HH:MM",
    className = "",
    id,
    showNow = false,
    error = null,
  } = props;

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  // The field stores 24-hour, which is right for the record and ambiguous to
  // read at a glance — so echo the 12-hour reading next to the label. Someone
  // who meant half past two in the afternoon can see whether they got it.
  const twelveHour = formatHhMmAs12Hour(value);
  const isUnreadable = value.trim() !== "" && parseTimeInput(value) === null;

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        trailing={
          twelveHour ? (
            <Text
              as="span"
              className="text-ehs-dark-blue text-xs font-semibold"
            >
              {twelveHour}
            </Text>
          ) : undefined
        }
      />

      <div className="relative">
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(maskHhMm(event.target.value))}
          // Normalizing on blur rather than per-keystroke: rewriting "2:3" to
          // "02:03" while someone is still typing "2:30" is how you fight the
          // person filling the form.
          onBlur={() => {
            if (!value.trim()) return;
            onChange(normalizeHhMm(value));
          }}
          aria-invalid={error || isUnreadable ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${FIELD_INPUT_CLASS} pr-9`}
          maxLength={8}
        />
        <Icon
          icon="mdi:clock-outline"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-[15px] -translate-y-1/2"
          aria-hidden="true"
        />
      </div>

      {showNow ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(nowHhMm())}
            className="text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-dark-bg cursor-pointer rounded-full border border-[rgba(15,23,42,0.1)] px-2 py-px text-[11px] font-semibold transition-colors"
          >
            Now
          </button>
          <Text as="span" className="text-ehs-muted-text text-[11px]">
            24h or 2:30 PM
          </Text>
        </div>
      ) : null}

      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}
