"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { SelectOption } from "@/components/inputs/SelectInput";
import { ehsFieldClass, ehsLabelClass } from "@/lib/ehs-classes";

export type CreatableSelectInputProps = Readonly<{
  label?: ReactNode;
  placeholder: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Called when the user submits a new option from the dropdown footer. */
  onCreate: (label: string) => void | Promise<void>;
  createLabel?: string;
  createPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  isCreating?: boolean;
  maxCreateLength?: number;
  labelClassName?: string;
  wrapperClassName?: string;
  className?: string;
  id?: string;
}>;

type MenuPosition = Readonly<{
  top: number;
  left: number;
  width: number;
}>;

/**
 * Single-select dropdown with an inline “add new option” footer.
 * Menu is portaled so parent overflow cannot clip it.
 */
export function CreatableSelectInput(
  props: Readonly<CreatableSelectInputProps>,
) {
  const {
    label,
    placeholder,
    options,
    value,
    onChange,
    onCreate,
    createLabel = "Add new option",
    createPlaceholder = "Enter name…",
    required = false,
    disabled = false,
    isCreating = false,
    maxCreateLength = 100,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
    className = "",
    id: idProp,
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const selected = options.find((option) => option.value === value);

  const close = () => {
    setOpen(false);
    setIsAdding(false);
    setNewLabel("");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuHeight = menuRef.current?.offsetHeight ?? 240;
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
      const top = openUpward
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;

      setPosition({
        top,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length, isAdding, isCreating]);

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
      close();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const submitCreate = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed || isCreating || disabled) {
      return;
    }
    try {
      await onCreate(trimmed);
      close();
    } catch {
      // Parent handles toast; keep the add form open for retry.
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }
  };

  const menu =
    mounted && open && position
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="rounded-2.5 fixed z-120 overflow-hidden border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14)]"
          >
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-52 overflow-y-auto p-1"
            >
              {options.length === 0 ? (
                <li className="text-3.25 px-2.5 py-2 text-[#8892a3]">
                  No options yet
                </li>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          close();
                        }}
                        className={[
                          "text-3.5 rounded-2 flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-[rgba(8,145,166,0.12)] text-[#056e7e]"
                            : "text-[#0b1320] hover:bg-[rgba(15,23,42,0.04)]",
                        ].join(" ")}
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
                })
              )}
            </ul>

            <div className="border-t border-[rgba(15,23,42,0.08)]">
              {isAdding ? (
                <div className="flex flex-col gap-2 p-2.5">
                  <input
                    value={newLabel}
                    maxLength={maxCreateLength}
                    placeholder={createPlaceholder}
                    aria-label={createLabel}
                    disabled={isCreating || disabled}
                    autoFocus
                    onChange={(event) => setNewLabel(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void submitCreate();
                      }
                    }}
                    className="text-3.5 rounded-2 h-9 w-full min-w-0 border border-[rgba(15,23,42,0.1)] bg-[#eef1f6] px-2.5 text-[#0b1320] outline-none focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={() => {
                        setIsAdding(false);
                        setNewLabel("");
                      }}
                      className="text-3.25 cursor-pointer px-2 py-1 font-medium text-[#566072] transition-colors hover:text-[#0b1320] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreating || disabled || !newLabel.trim()}
                      onClick={() => {
                        void submitCreate();
                      }}
                      className="text-3.25 cursor-pointer rounded-lg bg-[#0891a6] px-3 py-1 font-semibold text-white transition-colors hover:bg-[#056e7e] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isCreating ? "Adding…" : "Add"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={disabled || isCreating}
                  onClick={() => setIsAdding(true)}
                  className="text-3.25 flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left font-semibold text-[#0891a6] transition-colors hover:bg-[rgba(8,145,166,0.06)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                  {createLabel}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  const control = (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        onKeyDown={onTriggerKeyDown}
        className={[
          "rounded-2.5 backdrop-blur-1.25 flex h-9 w-full min-w-0 items-center gap-2 border border-[rgba(15,23,42,0.08)] bg-white/55 px-3 py-2 text-left transition-colors outline-none hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70 sm:h-9",
          open
            ? "ring-0.75 border-[#0891a6] ring-[#0891a6]/15"
            : "focus-visible:ring-0.75 focus-visible:border-[#0891a6] focus-visible:ring-[#0891a6]/15",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? (
            <Text as="span" className="text-3.5 text-[#0b1320]">
              {selected.label}
            </Text>
          ) : (
            <Text as="span" className="text-3.5 text-[#8892a3]">
              {placeholder}
            </Text>
          )}
        </span>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="size-4 shrink-0 text-[#8892a3]"
          aria-hidden="true"
        />
      </button>

      {menu}

      <input
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        value={value}
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
