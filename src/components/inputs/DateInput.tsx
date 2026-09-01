"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenu } from "@/hooks/use-anchored-menu";
import {
  FieldError,
  FieldLabel,
  FieldHint,
} from "@/components/ui/field-primitives";
import { CalendarPopover } from "@/components/ui/CalendarPopover";
import {
  FIELD_INPUT_CLASS,
  FIELD_INPUT_LG_CLASS,
} from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import {
  addDays,
  formatMmDdYyyy,
  isSameDay,
  maskMmDdYyyy,
  parseMmDdYyyy,
  today,
} from "@/lib/date-time-field";

const EMBEDDED_INPUT_CLASS = `h-10 ${FIELD_INPUT_LG_CLASS}`;

export type DateInputQuickPick = "today" | "yesterday";

export type DateInputProps = Readonly<{
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
  quickPicks?: readonly DateInputQuickPick[];
  /** Validation message from the parent, shown under the field. */
  error?: string | null;
  /** Report forms use the default styling; modals use `embedded` with a portaled calendar. */
  variant?: "report" | "embedded";
  /** When true, omit the built-in label (parent already renders one). */
  hideLabel?: boolean;
  /** Extra classes merged onto the input control. */
  inputClassName?: string;
}>;

const QUICK_PICK_LABELS: Record<DateInputQuickPick, string> = {
  today: "Today",
  yesterday: "Yesterday",
};

export function DateInput(props: Readonly<DateInputProps>) {
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
    variant = "report",
    hideLabel = false,
    inputClassName = "",
  } = props;

  const isEmbedded = variant === "embedded";

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuStyle = useAnchoredMenu({
    open: open && isEmbedded,
    anchorRef: inputWrapperRef,
    menuRef,
    // The calendar grid has a width of its own, and is centred on the field
    // rather than left-aligned to it because it is usually the wider of the two.
    minWidth: 260,
    align: "center",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /** Closing hands focus back to the trigger — the calendar took it on open. */
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  const selected = parseMmDdYyyy(value);
  const min = minDate ? parseMmDdYyyy(minDate) : null;
  const max = maxDate ? parseMmDdYyyy(maxDate) : null;

  useDismissOnOutsideClick(rootRef, open && !isEmbedded, () => setOpen(false));

  useEffect(() => {
    if (!isEmbedded || !open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isEmbedded, open]);

  const todayDate = today();
  const quickPickDates: Record<DateInputQuickPick, Date> = {
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

  const inputClass = [
    isEmbedded ? EMBEDDED_INPUT_CLASS : FIELD_INPUT_CLASS,
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const calendarPopover = (
    <CalendarPopover
      value={selected}
      minDate={min}
      maxDate={max}
      onSelect={(date) => {
        onChange(formatMmDdYyyy(date));
        close();
      }}
      onClose={close}
    />
  );

  const inlineCalendar = open && !isEmbedded ? calendarPopover : null;

  const portaledCalendar =
    isEmbedded && mounted && open
      ? createPortal(
          <div ref={menuRef} style={menuStyle} className="z-120">
            <CalendarPopover
              value={selected}
              minDate={min}
              maxDate={max}
              onSelect={(date) => {
                onChange(formatMmDdYyyy(date));
                close();
              }}
              onClose={close}
              className="animate-popover-in rounded-3 border-ehs-border-ink/10 bg-ehs-surface w-full border p-2.5 shadow-(--ehs-shadow-popover)"
            />
          </div>,
          document.body,
        )
      : null;

  const inputControl = (
    <div ref={inputWrapperRef} className="relative min-w-0">
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
        className={`${inputClass} pr-9`}
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
          className="size-3.75"
          aria-hidden="true"
        />
      </button>

      {inlineCalendar}
    </div>
  );

  const quickPickButtons =
    visibleQuickPicks.length > 0 ? (
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
                "text-2.75 cursor-pointer rounded-full px-2 py-px font-semibold transition-colors",
                isActive
                  ? "bg-ehs-light-blue text-ehs-dark-blue"
                  : "text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-dark-bg border-ehs-border-ink/10 border",
              ].join(" ")}
            >
              {QUICK_PICK_LABELS[pick]}
            </button>
          );
        })}
      </div>
    ) : null;

  if (isEmbedded) {
    return (
      <div
        className={["flex min-w-0 flex-col gap-1.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        {hideLabel ? null : (
          <label
            htmlFor={inputId}
            className="text-ehs-gray block text-sm leading-[19.5px]"
          >
            {label}
            {required ? <span className="text-ehs-red"> *</span> : null}
          </label>
        )}

        <div ref={rootRef} className="relative min-w-0">
          {inputControl}
        </div>

        {quickPickButtons}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
        {portaledCalendar}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      data-field-error={error ? "true" : undefined}
    >
      <FieldLabel label={label} required={required} />

      {inputControl}

      {quickPickButtons}

      {trailingHint && !error ? <FieldHint>{trailingHint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
