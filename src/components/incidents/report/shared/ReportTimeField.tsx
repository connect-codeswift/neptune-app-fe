"use client";

import { Icon } from "@iconify/react";
import { useId, useRef } from "react";
import { Text } from "@/components/Text";
import {
  ReportFieldLabel,
  reportFieldInputClass,
} from "@/components/incidents/report/shared/ReportFormField";
import {
  maskHhMm,
  normalizeHhMm,
} from "@/components/incidents/report/shared/report-date-time";

export type ReportTimeFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  trailingHint?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}>;

export function ReportTimeField(props: Readonly<ReportTimeFieldProps>) {
  const {
    label,
    value,
    onChange,
    required,
    trailingHint = "24-hour",
    placeholder = "HH:MM",
    className = "",
    id,
  } = props;

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const pickerRef = useRef<HTMLInputElement>(null);
  const normalized = normalizeHhMm(value);
  const pickerValue = /^\d{2}:\d{2}$/.test(normalized) ? normalized : "";

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      try {
        picker.showPicker();
        return;
      } catch {
        // Fall through to click() when showPicker is blocked.
      }
    }
    picker.click();
  };

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
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(maskHhMm(event.target.value))}
          onBlur={() => {
            if (!value.trim()) return;
            onChange(normalizeHhMm(value));
          }}
          className={`${reportFieldInputClass} pr-9`}
          pattern="\d{2}:\d{2}"
          maxLength={5}
        />
        <input
          ref={pickerRef}
          type="time"
          tabIndex={-1}
          aria-hidden="true"
          value={pickerValue}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next ? normalizeHhMm(next) : "");
          }}
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        />
        <button
          type="button"
          onClick={openPicker}
          className="text-ehs-muted-text absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 transition hover:text-ehs-dark-bg"
          aria-label={`Open time picker for ${label}`}
        >
          <Icon icon="mdi:clock-outline" className="size-[13px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
