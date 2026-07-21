"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { SelectFieldConfig, SelectOption } from "./types";

export type SelectWithCustomControlProps = Readonly<{
  field: SelectFieldConfig;
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
  triggerClassName: string;
}>;

/** Normalised key used to detect duplicates between built-in and custom entries. */
function optionKey(option: Pick<SelectOption, "code" | "label">): string {
  return `${option.code ?? ""}|${option.label}`.trim().toLowerCase();
}

function OptionRow(
  props: Readonly<{
    option: SelectOption;
    selected: boolean;
    onSelect: () => void;
  }>,
) {
  const { option, selected, onSelect } = props;

  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={[
          "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors",
          selected ? "bg-ehs-light-bg/70" : "hover:bg-ehs-light-bg/50",
        ].join(" ")}
      >
        {option.code ? (
          <span className="bg-ehs-light-bg text-ehs-gray shrink-0 rounded-md px-2 py-0.5 font-semibold">
            {option.code}
          </span>
        ) : null}
        <span
          className={[
            "min-w-0 flex-1",
            selected ? "text-ehs-dark-bg font-semibold" : "text-ehs-dark-bg",
          ].join(" ")}
        >
          {option.label}
        </span>
        {selected ? (
          <Icon
            icon="mdi:check"
            className="text-ehs-normal-blue size-4 shrink-0"
            aria-hidden="true"
          />
        ) : null}
      </button>
    </li>
  );
}

function AddCustomForm(
  props: Readonly<{
    placeholder: string;
    inputLabel: string;
    onAdd: (option: SelectOption) => void;
    onCancel: () => void;
  }>,
) {
  const { placeholder, inputLabel, onAdd, onCancel } = props;
  const [label, setLabel] = useState("");

  const trimmedLabel = label.trim();
  const canAdd = trimmedLabel.length > 0;

  const submit = () => {
    if (!canAdd) return;

    // A single input carries both parts, e.g. "H201 Explosive; mass explosion
    // hazard". Split off a leading H-code so it renders as the badge; text
    // without one becomes a plain statement with no badge.
    const match = /^(H\d{3}[A-Za-z]*)\s*[-–—:.]?\s+(.+)$/i.exec(trimmedLabel);
    const code = match?.[1].toUpperCase();
    const statement = match?.[2].trim() ?? trimmedLabel;

    onAdd({
      value: `${(code ?? statement).toLowerCase()}`,
      label: statement,
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex gap-2">
        <input
          value={label}
          placeholder={placeholder}
          aria-label={inputLabel}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          className="border-ehs-normal-blue/40 focus:border-ehs-normal-blue min-w-0 flex-1 rounded-lg border bg-white px-2.5 py-1.5 outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-ehs-gray hover:text-ehs-dark-bg cursor-pointer px-2 py-1 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canAdd}
          className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover cursor-pointer rounded-lg px-3 py-1 font-semibold text-white transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/**
 * Select control backed by a custom listbox so it can offer an
 * "add your own option" footer, which a native `<select>` cannot render.
 */
export function SelectWithCustomControl(props: SelectWithCustomControlProps) {
  const { field, value, invalid, onChange, triggerClassName } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [customOptions, setCustomOptions] = useState<SelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const options = [...field.options, ...customOptions];
  const selected = options.find((option) => option.value === value);

  const close = () => {
    setIsOpen(false);
    setIsAdding(false);
  };

  // Close on outside click and on Escape while the popover is open.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // A custom entry is appended to the end of the list, so bring the current
  // selection into view rather than leaving it below the fold.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  const addCustomOption = (option: SelectOption) => {
    const existing = options.find(
      (entry) => optionKey(entry) === optionKey(option),
    );
    // Re-selecting an equivalent entry beats creating a duplicate row.
    if (existing) {
      onChange(existing.value);
    } else {
      setCustomOptions((prev) => [...prev, option]);
      onChange(option.value);
    }
    close();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={field.name}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className={[triggerClassName, "flex items-center gap-2 text-left"].join(
          " ",
        )}
      >
        {selected?.code ? (
          <span className="bg-ehs-light-bg text-ehs-gray shrink-0 rounded-md px-2 py-0.5 font-semibold">
            {selected.code}
          </span>
        ) : null}
        <span
          className={[
            "min-w-0 flex-1 truncate",
            selected ? "text-ehs-dark-bg" : "text-ehs-muted-text",
          ].join(" ")}
        >
          {selected?.label ?? field.placeholder ?? "Select an option"}
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
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-900/10 bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={field.label}
            className="max-h-64 overflow-y-auto py-1"
          >
            {options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                selected={option.value === value}
                onSelect={() => {
                  onChange(option.value);
                  close();
                }}
              />
            ))}
          </ul>

          <div className="border-t border-slate-900/10">
            {isAdding ? (
              <AddCustomForm
                placeholder={
                  field.addCustomPlaceholder ?? `Add a ${field.label}`
                }
                inputLabel={`Custom ${field.label}`}
                onAdd={addCustomOption}
                onCancel={() => setIsAdding(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-ehs-normal-blue hover:bg-ehs-light-bg/50 flex w-full cursor-pointer items-center gap-2 p-3 font-semibold transition-colors"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                {field.addCustomLabel ?? "Add custom option"}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Keeps the value in the DOM for native form semantics. */}
      <input type="hidden" name={field.name} value={value} />
    </div>
  );
}
