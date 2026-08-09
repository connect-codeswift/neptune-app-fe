"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

export type GlassSelectOption = Readonly<{ value: string; label: string }>;

export type GlassSelectProps = Readonly<{
  options: readonly GlassSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  /** Rendered into a hidden input so the value participates in forms. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  triggerClassName?: string;
}>;

/**
 * A native <select>'s popup is drawn by the operating system and cannot be
 * styled — no radius, no blur, no palette — which is why it breaks the glass
 * design wherever it appears. This is the app-styled replacement: the same
 * combobox/listbox pattern as the form-builder's SelectWithCustomControl,
 * without the form-builder coupling.
 *
 * Use it for plain value/onChange selects (filters, toolbars, wizard fields
 * with their own validation). Keep a native <select> where the form leans on
 * native constraint validation (required + form.checkValidity()), which this
 * does not replicate.
 */
export function GlassSelect(props: GlassSelectProps) {
  const {
    options,
    value,
    onChange,
    placeholder = "Select an option",
    name,
    disabled = false,
    invalid = false,
    className = "",
    triggerClassName = FIELD_INPUT_LG_CLASS,
  } = props;
  const ariaLabel = props["aria-label"];

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        return;
      }
      const rows = [
        ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="option"]',
        ) ?? []),
      ];
      if (rows.length === 0) return;
      event.preventDefault();

      const activeIndex = rows.findIndex(
        (row) => row === document.activeElement,
      );
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? rows.length - 1
            : event.key === "ArrowDown"
              ? Math.min(rows.length - 1, activeIndex + 1)
              : activeIndex === -1
                ? rows.length - 1
                : Math.max(0, activeIndex - 1);
      rows[nextIndex]?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={["relative", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className={[
          triggerClassName,
          "flex cursor-pointer items-center gap-2 text-left",
        ].join(" ")}
      >
        <span
          className={[
            "min-w-0 flex-1 truncate",
            selected ? "text-ehs-dark-bg" : "text-ehs-muted-text",
          ].join(" ")}
        >
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={[
            "text-ehs-muted-text size-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        // 85% fill rather than the cards' 50: a floating menu overlaps
        // arbitrary content and has to stay readable over all of it.
        <div className="animate-popover-in absolute z-20 mt-1.5 w-full min-w-40 overflow-hidden rounded-xl border border-white/60 bg-white/85 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-64 overflow-y-auto py-1"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-ehs-light-bg/70 text-ehs-dark-bg font-semibold"
                        : "text-ehs-dark-bg hover:bg-ehs-light-bg/50",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <Icon
                        icon="mdi:check"
                        className="text-ehs-normal-blue size-4 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
