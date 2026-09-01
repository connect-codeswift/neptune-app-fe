"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenu } from "@/hooks/use-anchored-menu";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { SelectOption } from "@/components/inputs/SelectInput";
import { ehsFieldClass, ehsLabelClass } from "@/lib/ehs-classes";

export type MultiSelectInputProps = Readonly<{
  label?: ReactNode;
  placeholder: string;
  options: readonly SelectOption[];
  value: readonly string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  labelClassName?: string;
  wrapperClassName?: string;
  className?: string;
  id?: string;
}>;

/**
 * Dropdown multi-select with removable chips. Matches SelectInput field chrome.
 * Menu is portaled so parent overflow/borders cannot clip it.
 */
export function MultiSelectInput(props: Readonly<MultiSelectInputProps>) {
  const {
    label,
    placeholder,
    options,
    value,
    onChange,
    required = false,
    disabled = false,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
    className = "",
    id: idProp,
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuStyle = useAnchoredMenu({
    open,
    anchorRef: triggerRef,
    menuRef,
    gap: 4,
  });

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
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

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((entry) => entry !== nextValue));
      return;
    }
    onChange([...value, nextValue]);
  };

  const removeValue = (nextValue: string) => {
    onChange(value.filter((entry) => entry !== nextValue));
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }
  };

  const menu =
    mounted && open
      ? createPortal(
          <ul
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            style={menuStyle}
            className="rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface z-120 max-h-52 overflow-y-auto border p-1 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14)]"
          >
            {options.map((option) => {
              const selected = value.includes(option.value);
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={[
                      "text-3.5 rounded-2 flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left transition-colors",
                      selected
                        ? "bg-ehs-normal-blue/12 text-ehs-dark-blue"
                        : "text-ehs-dark-bg hover:bg-ehs-surface-inverse/4",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex size-4 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-on-accent"
                          : "border-ehs-border-strong bg-ehs-surface",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <Icon icon="mdi:check" className="size-3" />
                      ) : null}
                    </span>
                    <span className="min-w-0 truncate">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  const control = (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        onKeyDown={onTriggerKeyDown}
        className={[
          "rounded-2.5 backdrop-blur-1.25 border-ehs-border-ink/8 bg-ehs-surface/55 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 flex w-full min-w-0 items-center gap-2 border px-3 py-1.5 transition-colors outline-none",
          open
            ? "ring-0.75 border-ehs-normal-blue ring-ehs-normal-blue/15"
            : "focus-visible:ring-0.75 focus-visible:border-ehs-normal-blue focus-visible:ring-ehs-normal-blue/15",
          selectedOptions.length > 0 ? "min-h-9" : "h-9 sm:h-9",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedOptions.length === 0 ? (
            <Text as="span" className="text-3.5 text-ehs-muted-text">
              {placeholder}
            </Text>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="bg-ehs-surface/90 text-ehs-dark-bg ring-ehs-border inline-flex max-w-full items-center gap-1 rounded-md py-0.5 pr-0.5 pl-1.5 text-xs leading-4 font-medium ring-1"
              >
                <span className="truncate">{option.label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeValue(option.value);
                  }}
                  className="text-ehs-muted-text hover:bg-ehs-surface-inverse/6 hover:text-ehs-dark-bg inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded transition-colors disabled:cursor-not-allowed"
                >
                  <Icon
                    icon="mdi:close"
                    className="size-3"
                    aria-hidden="true"
                  />
                </button>
              </span>
            ))
          )}
        </div>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="text-ehs-muted-text size-4 shrink-0"
          aria-hidden="true"
        />
      </div>

      {menu}

      <input
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        value={value.join(",")}
        required={required}
        onChange={() => undefined}
      />
    </div>
  );

  if (!label) {
    return control;
  }

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {control}
    </div>
  );
}
