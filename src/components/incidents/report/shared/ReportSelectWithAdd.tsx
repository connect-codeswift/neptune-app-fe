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
  error?: string | null;
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
    error = null,
    className = "",
  } = props;

  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const mergedOptions = [
    ...options,
    ...customOptions.map((option) => ({ value: option, label: option })),
  ];

  function commit() {
    const trimmed = draft.trim();

    if (!trimmed) {
      setAddError("Enter a name for the new option.");
      inputRef.current?.focus();
      return;
    }

    const alreadyExists = mergedOptions.some(
      (option) =>
        option.label.toLowerCase() === trimmed.toLowerCase() ||
        option.value.toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      setAddError("That option already exists.");
      inputRef.current?.focus();
      return;
    }

    onAddCustomOption(trimmed);
    // Select what was just added — that's why the reporter added it.
    onChange(trimmed);
    setDraft("");
    setAddError(null);
    setIsAdding(false);
  }

  function cancel() {
    setDraft("");
    setAddError(null);
    setIsAdding(false);
  }

  return (
    <div className={["flex flex-col gap-1.5", className].join(" ")}>
      <ReportSelectField
        label={label}
        required={required}
        hint={hint}
        value={value}
        onChange={onChange}
        options={mergedOptions}
        error={error}
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
              aria-invalid={addError !== null}
              onChange={(event) => {
                setDraft(event.target.value);
                setAddError(null);
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
              className="border-ehs-border text-ehs-dark-bg placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <button
              type="button"
              onClick={commit}
              className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-light-text shrink-0 cursor-pointer rounded-lg px-3 py-2 text-sm font-bold transition-colors"
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
          {addError ? (
            <p className="text-ehs-red text-xs" role="alert">
              {addError}
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-ehs-normal-blue hover:text-ehs-dark-blue inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold transition-colors"
        >
          <Icon icon="mdi:plus" className="size-3.5" aria-hidden="true" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
