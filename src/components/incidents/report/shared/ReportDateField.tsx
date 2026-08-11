"use client";

import { Icon } from "@iconify/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
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

const EMBEDDED_INPUT_CLASS =
  "h-10 w-full rounded-[10px] bg-white px-3.5 text-sm text-ehs-dark-bg shadow-[0px_1px_2px_0px_rgba(15,23,42,0.06)] outline-none placeholder:text-ehs-muted-text focus:ring-2 focus:ring-ehs-normal-blue/25";

type MenuPosition = Readonly<{
  top: number;
  left: number;
  width: number;
}>;

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
  /** Report forms use the default styling; modals use `embedded` with a portaled calendar. */
  variant?: "report" | "embedded";
  /** When true, omit the built-in label (parent already renders one). */
  hideLabel?: boolean;
  /** Extra classes merged onto the input control. */
  inputClassName?: string;
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
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

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

  useLayoutEffect(() => {
    if (!isEmbedded || !open || !inputWrapperRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = inputWrapperRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuWidth = Math.max(260, rect.width);
      const menuHeight = menuRef.current?.offsetHeight ?? 320;
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
      const top = openUpward
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;
      const left = Math.min(
        Math.max(8, rect.left + rect.width / 2 - menuWidth / 2),
        window.innerWidth - menuWidth - 8,
      );

      setMenuPosition({
        top,
        left,
        width: menuWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isEmbedded, open, value, minDate, maxDate]);

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

  const inputClass = [
    isEmbedded ? EMBEDDED_INPUT_CLASS : FIELD_INPUT_CLASS,
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const calendarPopover = (
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
  );

  const inlineCalendar =
    open && !isEmbedded ? calendarPopover : null;

  const portaledCalendar =
    isEmbedded && mounted && open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            style={
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              } satisfies CSSProperties
            }
            className="fixed z-[120]"
          >
            <ReportCalendarPopover
              value={selected}
              minDate={min}
              maxDate={max}
              onSelect={(date) => {
                onChange(formatMmDdYyyy(date));
                close();
              }}
              onClose={close}
              className="animate-popover-in w-full rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-white p-2.5 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
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
          className="size-[15px]"
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
            className="block text-sm leading-[19.5px] text-ehs-gray"
          >
            {label}
            {required ? <span className="text-ehs-red"> *</span> : null}
          </label>
        )}

        <div ref={rootRef} className="relative min-w-0">
          {inputControl}
        </div>

        {quickPickButtons}
        {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
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

      {inputControl}

      {quickPickButtons}

      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}
