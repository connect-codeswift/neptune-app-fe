"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Text } from "@/components/Text";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import {
  FIELD_INPUT_CLASS,
  FIELD_TEXTAREA_CLASS,
  FIELD_TEXTAREA_WITH_CONTROLS_CLASS,
} from "@/components/ui/field-styles";

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
      <Text as="span" className="text-ehs-slate text-sm font-bold">
        {label}
      </Text>
      {required ? (
        <Text as="span" className="text-ehs-red text-sm">
          *
        </Text>
      ) : null}
      {hint ? (
        <span className="text-ehs-muted-text inline-flex items-center gap-1 text-xs">
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

export type ReportFieldErrorProps = Readonly<{
  id?: string;
  children: string;
}>;

/**
 * Inline validation message under a field. Pair it with `aria-invalid` and an
 * `aria-describedby` pointing at this `id` — the red text alone says nothing to
 * a screen reader, and `FIELD_BASE` already styles the border off `aria-invalid`.
 */
export function ReportFieldError(props: Readonly<ReportFieldErrorProps>) {
  const { id, children } = props;

  return (
    <p id={id} className="text-ehs-red flex items-start gap-1 text-2.75">
      <Icon
        icon="mdi:alert-circle-outline"
        className="mt-px size-3 shrink-0"
        aria-hidden="true"
      />
      <span className="min-w-0">{children}</span>
    </p>
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
            <Text as="span" className="text-ehs-muted-text text-xs">
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
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-3.25 -translate-y-1/2"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {helperText ? (
        <Text as="p" className="text-ehs-muted-text text-xs">
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}

export type ReportSelectFieldProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  trailingHint?: string;
  /**
   * Right-aligned label content. Takes precedence over `trailingHint`. Use for
   * anything that must not wrap — in a narrow grid column a wrapping label
   * grows a second line and drops this field's input below its neighbour's.
   */
  trailing?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  id?: string;
}>;

/**
 * Single-select dropdown.
 *
 * A custom listbox rather than a native `<select>`: the open menu of a native
 * one is drawn by the OS and takes none of the app's styling, so it landed in
 * the middle of a frosted form as a square, system-blue list. Everything else
 * that opens over this form — the affected-person picker, the calendar — is a
 * white rounded popover, and this now matches them.
 *
 * The trade is that a native select's keyboard and screen-reader behaviour has
 * to be rebuilt rather than inherited, which is what the roles and key handling
 * below are for.
 */
export function ReportSelectField(props: Readonly<ReportSelectFieldProps>) {
  const {
    label,
    value,
    onChange,
    options,
    required,
    hint,
    trailingHint,
    trailing,
    placeholder = "Select…",
    disabled = false,
    error = null,
    className = "",
    id,
  } = props;

  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const errorId = `${fieldId}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  function openMenu() {
    // Opening lands on the current answer, so arrow keys step from where the
    // field actually is rather than from the top of the list.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
      return;
    }

    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = activeIndex + delta;
      setActiveIndex(
        next < 0 ? options.length - 1 : next >= options.length ? 0 : next,
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeIndex);
    }
  }

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
        hint={hint}
        trailing={
          trailing ??
          (trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-xs">
              {trailingHint}
            </Text>
          ) : undefined)
        }
      />

      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKeyDown}
          className={[
            FIELD_INPUT_CLASS,
            "flex items-center gap-2 pr-9 text-left",
            disabled ? "" : "cursor-pointer",
            open
              ? "border-ehs-normal-blue ring-ehs-normal-blue/[0.15] ring-0.75"
              : "",
            selected ? "" : "text-ehs-muted-text",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="min-w-0 flex-1 truncate">
            {selected ? selected.label : placeholder}
          </span>
        </button>

        <Icon
          icon="mdi:chevron-down"
          className={[
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 transition-transform",
            open ? "text-ehs-normal-blue rotate-180" : "text-ehs-muted-text",
          ].join(" ")}
          aria-hidden="true"
        />

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="animate-popover-in absolute top-full right-0 left-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-white p-1 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    tabIndex={-1}
                    // Pointer-down, not click: the trigger's blur would
                    // otherwise close the menu before the click lands.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      commit(index);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2 rounded-2 px-2.5 py-2 text-left text-[13.5px] transition-colors",
                      isSelected
                        ? "text-ehs-dark-blue font-semibold"
                        : "text-ehs-dark-bg",
                      isActive ? "bg-[rgba(8,145,166,0.1)]" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <Icon
                        icon="mdi:check"
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}

export type ReportTextareaFieldProps = Readonly<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    label: string;
    required?: boolean;
    trailingHint?: string;
    className?: string;
    /**
     * Controls layered inside the field box — e.g. `<AiTextAssistant />`. They
     * position themselves against the wrapper this adds, and the textarea grows
     * a bottom strip so typed text never runs underneath them.
     */
    assistant?: ReactNode;
  }
>;

export function ReportTextareaField(props: Readonly<ReportTextareaFieldProps>) {
  const {
    label,
    required,
    trailingHint,
    assistant,
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
            <Text as="span" className="text-ehs-muted-text text-xs">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />
      <div className="relative z-0">
        <textarea
          id={id}
          className={
            assistant
              ? FIELD_TEXTAREA_WITH_CONTROLS_CLASS
              : FIELD_TEXTAREA_CLASS
          }
          {...rest}
        />
        {assistant}
      </div>
    </div>
  );
}
