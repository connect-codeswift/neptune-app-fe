"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { ReportSelectField } from "@/components/incidents/report/shared/ReportFormField";

export type ReportSelectWithAddProps = Readonly<{
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** The built-in options for this field. */
  options: readonly { value: string; label: string }[];
  /** Options the reporter has already added. */
  customOptions: readonly string[];
  onAddCustomOption: (option: string) => void;
  /** Wording for the toggle, e.g. "Add more treatments". */
  addLabel: string;
  addPlaceholder?: string;
  className?: string;
}>;

/**
 * A select whose option list the reporter can extend inline.
 *
 * The picklists here are never complete — sites hit treatments, mechanisms and
 * injury types the seed list doesn't cover, and the alternative is everyone
 * choosing "Other" and losing the detail. A typed option is stored with its
 * text as both value and label, so the mapper persists it unchanged
 * (`optionLabel` falls back to the raw value for anything it doesn't know).
 */
export function ReportSelectWithAdd(props: Readonly<ReportSelectWithAddProps>) {
  const {
    label,
    required,
    hint,
    value,
    onChange,
    options,
    customOptions,
    onAddCustomOption,
    addLabel,
    addPlaceholder = "Type a new option…",
    className = "",
  } = props;

  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const mergedOptions = [
    ...options,
    ...customOptions.map((option) => ({ value: option, label: option })),
  ];

  function commit() {
    const trimmed = draft.trim();

    if (!trimmed) {
      setError("Enter a name for the new option.");
      inputRef.current?.focus();
      return;
    }

    const alreadyExists = mergedOptions.some(
      (option) =>
        option.label.toLowerCase() === trimmed.toLowerCase() ||
        option.value.toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      setError("That option already exists.");
      inputRef.current?.focus();
      return;
    }

    onAddCustomOption(trimmed);
    // Select what was just added — that's why the reporter added it.
    onChange(trimmed);
    setDraft("");
    setError(null);
    setIsAdding(false);
  }

  function cancel() {
    setDraft("");
    setError(null);
    setIsAdding(false);
  }

  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      <ReportSelectField
        label={label}
        required={required}
        hint={hint}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={mergedOptions}
      />

      {isAdding ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              autoFocus
              value={draft}
              placeholder={addPlaceholder}
              aria-label={`New ${label.toLowerCase()} option`}
              aria-invalid={error !== null}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancel();
                }
              }}
              className="border-ehs-border text-ehs-dark-bg placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-[12px] outline-none focus:ring-2"
            />
            <button
              type="button"
              onClick={commit}
              className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover shrink-0 cursor-pointer rounded-lg px-3 py-2 text-[12px] font-bold text-white transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={cancel}
              aria-label="Cancel adding an option"
              className="text-ehs-muted-text hover:text-ehs-gray shrink-0 cursor-pointer rounded-lg p-2 transition-colors"
            >
              <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
            </button>
          </div>
          {error ? (
            <p className="text-ehs-red text-[10.8px]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-ehs-normal-blue hover:text-ehs-dark-blue inline-flex w-fit cursor-pointer items-center gap-1 text-[11px] font-semibold transition-colors"
        >
          <Icon icon="mdi:plus" className="size-3.5" aria-hidden="true" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
