"use client";

import { Icon } from "@iconify/react";
import { useId, useRef, useState } from "react";
import { Text } from "@/components/Text";
import {
  ReportFieldError,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportCalendarPopover } from "@/components/incidents/report/shared/ReportCalendarPopover";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import {
  addDays,
  formatMmDdYyyy,
  isSameDay,
  maskMmDdYyyy,
  parseMmDdYyyy,
  today,
} from "@/components/incidents/report/shared/report-date-time";

export type ReportDateQuickPick = "today" | "yesterday";

export type ReportDateFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  trailingHint?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Inclusive bounds, as `MM/DD/YYYY`. Outside days can't be picked or typed. */
  minDate?: string;
  maxDate?: string;
  /** Shortcut chips under the field. Ones outside the bounds are hidden. */
  quickPicks?: readonly ReportDateQuickPick[];
  /** Validation message from the parent, shown under the field. */
  error?: string | null;
}>;

const QUICK_PICK_LABELS: Record<ReportDateQuickPick, string> = {
  today: "Today",
  yesterday: "Yesterday",
};

export function ReportDateField(props: Readonly<ReportDateFieldProps>) {
  const {
    label,
    value,
    onChange,
    required,
    trailingHint,
    placeholder = "MM/DD/YYYY",
    className = "",
    id,
    minDate,
    maxDate,
    quickPicks,
    error = null,
  } = props;

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  /** Closing hands focus back to the trigger — the calendar took it on open. */
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  const selected = parseMmDdYyyy(value);
  const min = minDate ? parseMmDdYyyy(minDate) : null;
  const max = maxDate ? parseMmDdYyyy(maxDate) : null;

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const todayDate = today();
  const quickPickDates: Record<ReportDateQuickPick, Date> = {
    today: todayDate,
    yesterday: addDays(todayDate, -1),
  };

  // A shortcut that lands on a disabled day is worse than no shortcut — it
  // offers a choice the field will then refuse.
  const visibleQuickPicks = (quickPicks ?? []).filter((pick) => {
    const date = quickPickDates[pick];
    if (min && date < min) return false;
    if (max && date > max) return false;
    return true;
  });

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ReportFieldLabel
        label={label}
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-xs">
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
          onChange={(event) => onChange(maskMmDdYyyy(event.target.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${FIELD_INPUT_CLASS} pr-9`}
          maxLength={10}
        />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={`Open calendar for ${label}`}
          aria-expanded={open}
          className={[
            "absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 transition-colors",
            open
              ? "text-ehs-normal-blue"
              : "text-ehs-muted-text hover:text-ehs-dark-bg",
          ].join(" ")}
        >
          <Icon
            icon="mdi:calendar-outline"
            className="size-[15px]"
            aria-hidden="true"
          />
        </button>

        {open ? (
          <ReportCalendarPopover
            value={selected}
            minDate={min}
            maxDate={max}
            onSelect={(date) => {
              onChange(formatMmDdYyyy(date));
              close();
            }}
            onClose={close}
          />
        ) : null}
      </div>

      {visibleQuickPicks.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleQuickPicks.map((pick) => {
            const date = quickPickDates[pick];
            const isActive = selected ? isSameDay(selected, date) : false;

            return (
              <button
                key={pick}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(formatMmDdYyyy(date))}
                className={[
                  "cursor-pointer rounded-full px-2 py-px text-[11px] font-semibold transition-colors",
                  isActive
                    ? "bg-ehs-light-blue text-ehs-dark-blue"
                    : "text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-dark-bg border border-[rgba(15,23,42,0.1)]",
                ].join(" ")}
              >
                {QUICK_PICK_LABELS[pick]}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}
