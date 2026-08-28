"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  ReportFieldError,
  ReportFieldHint,
  ReportFieldLabel,
} from "./ReportFormField";
import { INCIDENT_LOCATION_OPTIONS } from "@/forms/incident-module/locations";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";

export type ReportLocationsFieldProps = Readonly<{
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  locations: readonly string[];
  customLocations: readonly string[];
  onChange: (locations: readonly string[]) => void;
  onCustomLocationsChange: (customLocations: readonly string[]) => void;
  error?: string | null;
  className?: string;
}>;

function normalizeLocationEntry(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function dedupeLocations(entries: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const entry of entries) {
    const normalized = normalizeLocationEntry(entry);
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    next.push(normalized);
  }

  return next;
}

/** Comma-separated label for review, aside, and API mapping. */
export function formatIncidentLocationsLabel(
  locations: readonly string[],
): string {
  return dedupeLocations(locations).join(", ");
}

function locationKey(value: string): string {
  return value.toLowerCase();
}

function isSelected(locations: readonly string[], value: string): boolean {
  const key = locationKey(value);
  return locations.some((entry) => locationKey(entry) === key);
}

/**
 * Single-select location picker: choose one place from the site list or add a
 * custom area. An incident happens in exactly one location, so picking another
 * replaces the current choice. Kept separate from the auto-assigned plant /
 * site field above it.
 */
export function ReportLocationsField(
  props: Readonly<ReportLocationsFieldProps>,
) {
  const {
    label = "Location",
    required = false,
    hint,
    placeholder = "Select location",
    locations,
    customLocations,
    onChange,
    onCustomLocationsChange,
    error = null,
    className = "",
  } = props;

  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const listboxId = `${fieldId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const addInputId = `${fieldId}-custom`;

  useDismissOnOutsideClick(rootRef, open, () => {
    setOpen(false);
    setIsAdding(false);
    setDraft("");
    setAddError(null);
  });

  const dropdownOptions = useMemo(() => {
    const seedLabels = new Set(
      INCIDENT_LOCATION_OPTIONS.map((option) => option.label.toLowerCase()),
    );
    const extras = [...customLocations, ...locations].filter(
      (entry) => !seedLabels.has(entry.toLowerCase()),
    );

    return [
      ...INCIDENT_LOCATION_OPTIONS,
      ...dedupeLocations(extras).map((entry) => ({
        value: entry,
        label: entry,
      })),
    ];
  }, [customLocations, locations]);

  const selectLocation = (value: string) => {
    const normalized = normalizeLocationEntry(value);
    if (!normalized) {
      return;
    }

    // Re-picking the current value clears it; picking anything else replaces it.
    onChange(isSelected(locations, normalized) ? [] : [normalized]);
    setOpen(false);
  };

  const removeLocation = () => {
    onChange([]);
  };

  const commitCustom = () => {
    const trimmed = normalizeLocationEntry(draft);
    if (!trimmed) {
      setAddError("Enter a location name.");
      return;
    }

    const exists = dropdownOptions.some(
      (option) => locationKey(option.label) === locationKey(trimmed),
    );

    if (!exists) {
      onCustomLocationsChange(dedupeLocations([...customLocations, trimmed]));
    }

    onChange([trimmed]);
    setDraft("");
    setAddError(null);
    setIsAdding(false);
    setOpen(false);
  };

  const selected = locations[0] ?? null;
  const summary = selected ?? placeholder;

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      data-field-error={error ? "true" : undefined}
    >
      <ReportFieldLabel label={label} required={required} />

      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onClick={() => setOpen((current) => !current)}
          className={[
            FIELD_INPUT_CLASS,
            "flex w-full items-center gap-2 text-left",
            selected === null ? "pr-9" : "pr-16",
            open
              ? "border-ehs-normal-blue ring-ehs-normal-blue/[0.15] ring-0.75"
              : "",
            selected === null ? "text-ehs-muted-text" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon
            icon="mdi:map-marker-outline"
            className="text-ehs-dark-blue size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate font-medium">{summary}</span>
        </button>

        {selected !== null ? (
          <button
            type="button"
            onClick={removeLocation}
            aria-label={`Clear location ${selected}`}
            className="text-ehs-muted-text hover:text-ehs-darker absolute top-1/2 right-8 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
          >
            <Icon icon="mdi:close" className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}

        <Icon
          icon="mdi:chevron-down"
          className={[
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 transition-transform",
            open ? "text-ehs-normal-blue rotate-180" : "text-ehs-muted-text",
          ].join(" ")}
          aria-hidden="true"
        />

        {open ? (
          <div className="animate-popover-in rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden border shadow-(--ehs-shadow-popover)">
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto p-1"
            >
              {dropdownOptions.map((option) => {
                const isCurrent = isSelected(locations, option.label);

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isCurrent}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectLocation(option.label)}
                      className={[
                        "rounded-2 flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-[14px] transition-colors",
                        isCurrent
                          ? "text-ehs-dark-blue bg-ehs-normal-blue/10 font-semibold"
                          : "text-ehs-dark-bg hover:bg-ehs-normal-blue/6",
                      ].join(" ")}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {isCurrent ? (
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

            <div className="border-ehs-border-ink/8 border-t p-2">
              {isAdding ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      id={addInputId}
                      type="text"
                      autoFocus
                      value={draft}
                      placeholder="e.g. Chemical Area"
                      aria-label="Custom location"
                      aria-invalid={addError !== null}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        setAddError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitCustom();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setIsAdding(false);
                          setDraft("");
                          setAddError(null);
                        }
                      }}
                      className="border-ehs-border text-ehs-dark-bg placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 bg-ehs-surface min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={commitCustom}
                      className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-on-accent shrink-0 cursor-pointer rounded-lg px-3 py-2 text-sm font-bold transition-colors"
                    >
                      Add
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
                  className="text-ehs-normal-blue hover:text-ehs-dark-blue rounded-2 hover:bg-ehs-normal-blue/6 inline-flex w-full cursor-pointer items-center gap-1 px-2 py-2 text-sm font-semibold transition-colors"
                >
                  <Icon
                    icon="mdi:plus"
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  Add custom location
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? null : (
        <ReportFieldHint>
          {hint ?? "Select a location from the list, or add your own."}
        </ReportFieldHint>
      )}

      {error ? <ReportFieldError id={errorId}>{error}</ReportFieldError> : null}
    </div>
  );
}
