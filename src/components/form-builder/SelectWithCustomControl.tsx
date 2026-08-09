"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
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
          className={`${FIELD_INPUT_LG_CLASS} min-w-0 flex-1`}
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
  // The current value's option may live on a page that isn't loaded, so fall
  // back to the explicitly-provided selectedOption to keep the trigger labelled.
  const selected =
    options.find((option) => option.value === value) ??
    (field.selectedOption?.value === value ? field.selectedOption : undefined);

  const close = () => {
    setIsOpen(false);
    setIsAdding(false);
  };

  // Close on outside click; keyboard on the list: Escape closes, arrows move
  // through the option buttons, Home/End jump. Native selects give arrow
  // traversal for free, so the custom listbox has to match it before it can
  // stand in for one.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
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
              : // ArrowUp from the trigger (activeIndex -1) lands on the last row.
                activeIndex === -1
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
        {field.variant === "search" ? (
          // Reads as a search box whose menu opens from the round add button.
          <span
            className="bg-ehs-normal-blue flex size-7 shrink-0 items-center justify-center rounded-full text-white"
            aria-hidden="true"
          >
            <Icon icon="mdi:plus" className="size-4" />
          </span>
        ) : (
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
        )}
      </button>

      {isOpen ? (
        // Near-opaque (96%) on purpose. At 85% the content underneath read
        // straight through the menu — checkbox labels behind it were legible
        // through the option rows. A floating menu has to win against
        // whatever it covers, so the blur and hairline carry the material
        // here and the fill stays high.
        <div className="animate-popover-in absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/70 bg-white/96 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={field.label}
            className="max-h-64 overflow-y-auto py-1"
          >
            {options.length === 0 ? (
              <li className="text-ehs-muted-text px-3 py-2.5 text-sm">
                {field.pagination?.isLoading ? "Loading…" : "No options"}
              </li>
            ) : (
              options.map((option) => (
                <OptionRow
                  key={option.value}
                  option={option}
                  selected={option.value === value}
                  onSelect={() => {
                    onChange(option.value);
                    close();
                  }}
                />
              ))
            )}
          </ul>

          {field.pagination && field.pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-slate-900/10 px-3 py-2">
              <button
                type="button"
                disabled={field.pagination.pageNumber <= 1}
                onClick={() => field.pagination?.onPrev()}
                className="text-ehs-dark-bg cursor-pointer rounded-lg border border-slate-900/12 bg-white px-2.5 py-1 text-xs font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-ehs-gray text-xs tabular-nums">
                {field.pagination.isLoading
                  ? "Loading…"
                  : `Page ${String(field.pagination.pageNumber)} of ${String(field.pagination.totalPages)}`}
              </span>
              <button
                type="button"
                disabled={
                  field.pagination.pageNumber >= field.pagination.totalPages
                }
                onClick={() => field.pagination?.onNext()}
                className="text-ehs-dark-bg cursor-pointer rounded-lg border border-slate-900/12 bg-white px-2.5 py-1 text-xs font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}

          {field.allowCustom ? (
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
          ) : null}
        </div>
      ) : null}

      {/* Keeps the value in the DOM for native form semantics. */}
      <input type="hidden" name={field.name} value={value} />
    </div>
  );
}
