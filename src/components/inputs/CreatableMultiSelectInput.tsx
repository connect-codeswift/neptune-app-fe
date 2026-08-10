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

export type CreatableMultiSelectInputProps = Readonly<{
  label?: ReactNode;
  placeholder: string;
  options: readonly SelectOption[];
  value: readonly string[];
  onChange: (value: string[]) => void;
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
 * Multi-select dropdown with removable chips plus an inline "add new option"
 * footer. Menu is portaled so parent overflow/borders cannot clip it.
 */
export function CreatableMultiSelectInput(
  props: Readonly<CreatableMultiSelectInputProps>,
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

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
  }, [open, selectedOptions.length, options.length, isAdding, isCreating]);

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

  const submitCreate = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed || isCreating || disabled) {
      return;
    }
    try {
      await onCreate(trimmed);
      setIsAdding(false);
      setNewLabel("");
    } catch {
      // Parent handles toast; keep the add form open for retry.
    }
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
    mounted && open && position
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="fixed z-[120] overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14)]"
          >
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className="max-h-52 overflow-y-auto p-1"
            >
              {options.length === 0 ? (
                <li className="px-2.5 py-2 text-[13px] text-[#8892a3]">
                  No options yet
                </li>
              ) : (
                options.map((option) => {
                  const selected = value.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={selected}
                    >
                      <button
                        type="button"
                        onClick={() => toggleValue(option.value)}
                        className={[
                          "text-3.5 flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 text-left transition-colors",
                          selected
                            ? "bg-[rgba(8,145,166,0.12)] text-[#056e7e]"
                            : "text-[#0b1320] hover:bg-[rgba(15,23,42,0.04)]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "inline-flex size-4 shrink-0 items-center justify-center rounded border",
                            selected
                              ? "border-[#0891a6] bg-[#0891a6] text-white"
                              : "border-[rgba(15,23,42,0.2)] bg-white",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {selected ? (
                            <Icon icon="mdi:check" className="size-3" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
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
                    className="text-3.5 h-9 w-full min-w-0 rounded-[8px] border-[0.8px] border-[rgba(15,23,42,0.1)] bg-[#eef1f6] px-2.5 text-[#0b1320] outline-none focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={() => {
                        setIsAdding(false);
                        setNewLabel("");
                      }}
                      className="cursor-pointer px-2 py-1 text-[13px] font-medium text-[#566072] transition-colors hover:text-[#0b1320] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreating || disabled || !newLabel.trim()}
                      onClick={() => {
                        void submitCreate();
                      }}
                      className="cursor-pointer rounded-lg bg-[#0891a6] px-3 py-1 text-[13px] font-semibold text-white transition-colors hover:bg-[#056e7e] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-[#0891a6] transition-colors hover:bg-[rgba(8,145,166,0.06)] disabled:cursor-not-allowed disabled:opacity-50"
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
          "flex w-full min-w-0 items-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/55 px-3 py-1.5 backdrop-blur-[5px] transition-colors outline-none hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70",
          open
            ? "border-[#0891a6] ring-[3px] ring-[#0891a6]/15"
            : "focus-visible:border-[#0891a6] focus-visible:ring-[3px] focus-visible:ring-[#0891a6]/15",
          selectedOptions.length > 0 ? "min-h-9" : "h-9 sm:h-[36px]",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedOptions.length === 0 ? (
            <Text as="span" className="text-3.5 text-[#8892a3]">
              {placeholder}
            </Text>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/90 py-0.5 pr-0.5 pl-1.5 text-[12px] leading-4 font-medium text-[#0b1320] ring-1 ring-[rgba(15,23,42,0.1)]"
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
                  className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded text-[#8892a3] transition-colors hover:bg-[rgba(15,23,42,0.06)] hover:text-[#0b1320] disabled:cursor-not-allowed"
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
          className="size-4 shrink-0 text-[#8892a3]"
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
