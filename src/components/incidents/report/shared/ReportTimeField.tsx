"use client";

import { Icon } from "@iconify/react";
import { useId, useRef, useState } from "react";
import { Text } from "@/components/Text";
import {
  ReportFieldError,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportTimePopover } from "@/components/incidents/report/shared/ReportTimePopover";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  /** Closing hands focus back to the trigger — the popover took it on open. */
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  // The field stores 24-hour, which is right for the record and ambiguous to
  // read at a glance — so echo the 12-hour reading next to the label. Someone
  // who meant half past two in the afternoon can see whether they got it.
  const twelveHour = formatHhMmAs12Hour(value);
  const isUnreadable = value.trim() !== "" && parseTimeInput(value) === null;

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      data-field-error={error ? "true" : undefined}
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
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={`Open time picker for ${label}`}
          aria-expanded={open}
          className={[
            "absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 transition-colors",
            open
              ? "text-ehs-normal-blue"
              : "text-ehs-muted-text hover:text-ehs-dark-bg",
          ].join(" ")}
        >
          <Icon
            icon="mdi:clock-outline"
            className="size-3.75"
            aria-hidden="true"
          />
        </button>

        {open ? (
          <ReportTimePopover
            value={value}
            onSelect={onChange}
            onClose={close}
          />
        ) : null}
      </div>

      {showNow ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(nowHhMm())}
            className="text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-dark-bg cursor-pointer rounded-full border border-[rgba(15,23,42,0.1)] px-2 py-px text-2.75 font-semibold transition-colors"
          >
            Now
          </button>
          <Text as="span" className="text-ehs-muted-text text-2.75">
            24h or 2:30 PM
          </Text>
        </div>
      ) : null}

      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}
