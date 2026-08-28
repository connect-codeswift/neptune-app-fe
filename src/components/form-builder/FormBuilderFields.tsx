"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Toggle } from "@/components/ui/Toggle";
import { PhotoUploadControl } from "./PhotoUploadControl";
import { SelectWithCustomControl } from "./SelectWithCustomControl";
import { dateFieldMax, dateFieldMin } from "./types";
import { DateInput } from "@/components/inputs/DateInput";
import { isoToMmDdYyyy, mmDdYyyyToIso } from "@/lib/date-time-field";
import type {
  CheckboxGroupFieldConfig,
  ChipsFieldConfig,
  DateFieldConfig,
  FieldConfig,
  FieldValue,
  FormValues,
  PersonFieldConfig,
  PersonMultiFieldConfig,
  SelectMultiFieldConfig,
  SelectFieldConfig,
  SwitchFieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
  TilesFieldConfig,
  TileTone,
  TimeFieldConfig,
} from "./types";
import { UserPickerInput } from "@/components/inputs/UserPickerInput";
import { MultipleUsersPickerInput } from "@/components/inputs/MultipleUsersPickerInput";
import { MultiSelectInput } from "@/components/inputs/MultiSelectInput";
import { useUserOptions } from "@/hooks/use-user-options";
import { getAuthContext } from "@/lib/auth-context";
import {
  FIELD_INPUT_CLASS,
  FIELD_TEXTAREA_CLASS,
  FIELD_TEXTAREA_WITH_CONTROLS_CLASS,
} from "@/components/ui/field-styles";

const inputClass = FIELD_INPUT_CLASS;

// `!` so the red border reliably beats the base hairline (same-property
// utilities resolve by stylesheet order, not class order).
const errorRingClass =
  "border-ehs-red/60! focus:border-ehs-red! focus:ring-ehs-red/20!";

function FieldLabel(
  props: Readonly<{
    label: string;
    required?: boolean;
    showOptional?: boolean;
    optionalHint?: string;
    optionalHintClassName?: string;
    htmlFor: string;
    /** Larger section title used inside glass cards. */
    section?: boolean;
  }>,
) {
  const {
    label,
    required,
    showOptional,
    optionalHint,
    optionalHintClassName,
    htmlFor,
    section = false,
  } = props;
  const hint =
    optionalHint ?? (showOptional && !required ? "(optional)" : undefined);

  return (
    <label
      htmlFor={htmlFor}
      className={
        section
          ? "text3 text-ehs-darker block"
          : "text8 text-ehs-gray block font-semibold"
      }
    >
      {label}
      {required ? <span className="text-ehs-red"> *</span> : null}
      {hint ? (
        <span
          className={[
            "font-normal",
            optionalHintClassName ?? "text-ehs-placeholder",
          ].join(" ")}
        >
          {` ${hint}`}
        </span>
      ) : null}
    </label>
  );
}

/** "12/100" counter shown beside the label of a length-capped field. */
function CharacterCount(props: Readonly<{ value: string; maxLength: number }>) {
  const { value, maxLength } = props;

  return (
    <span className="text8 text-ehs-muted-text tabular-nums">
      {`${String(value.length)}/${String(maxLength)}`}
    </span>
  );
}

function FieldShell(
  props: Readonly<{
    field: FieldConfig;
    error?: string;
    /** Set false when the control renders its own error/helper text. */
    showMessages?: boolean;
    /** Set when a surrounding header already names the field. */
    hideLabel?: boolean;
    /** Rendered opposite the label, e.g. a character counter. */
    trailing?: React.ReactNode;
    children: React.ReactNode;
  }>,
) {
  const {
    field,
    error,
    showMessages = true,
    hideLabel = false,
    trailing,
    children,
  } = props;
  return (
    <div
      className={[
        "flex flex-col",
        field.card ? "gap-3 sm:gap-4" : "gap-1.5",
      ].join(" ")}
    >
      {hideLabel ? null : (
        <div className="flex items-center justify-between gap-3">
          <FieldLabel
            label={field.label}
            required={field.required}
            showOptional={field.showOptional}
            optionalHint={field.optionalHint}
            optionalHintClassName={field.optionalHintClassName}
            htmlFor={field.name}
            section={field.card === true}
          />
          {trailing}
        </div>
      )}
      {children}
      {!showMessages ? null : error ? (
        <Text as="p" className="text8 text-ehs-red">
          {error}
        </Text>
      ) : field.helperText ? (
        <Text as="p" className="text8 text-ehs-muted-text">
          {field.helperText}
        </Text>
      ) : null}
    </div>
  );
}

export type FieldRendererProps = Readonly<{
  field: FieldConfig;
  value: FieldValue;
  /** Full form map — person fields read the companion display-name value. */
  values: FormValues;
  error?: string;
  onChange: (value: FieldValue) => void;
  /** Patch one or more form keys in a single update (person id + display name). */
  onPatchValues: (patch: FormValues) => void;
}>;

function TextControl(
  props: Readonly<{
    field: TextFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;

  if (field.readOnly) {
    return (
      <div
        id={field.name}
        className={[inputClass, "text-ehs-gray flex items-center gap-2"].join(
          " ",
        )}
      >
        <span>{value}</span>
        {field.note ? (
          <span className="text8 text-ehs-muted-text">{field.note}</span>
        ) : null}
        {/* Keeps the value in the DOM for native form semantics. */}
        <input type="hidden" name={field.name} value={value} />
      </div>
    );
  }

  const input = (
    <input
      id={field.name}
      name={field.name}
      type={field.inputType ?? "text"}
      value={value}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={[
        inputClass,
        field.suggestions ? "pr-14" : "",
        error ? errorRingClass : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  if (!field.suggestions || field.suggestions.length === 0) return input;

  return (
    <TextSuggestions
      label={field.label}
      suggestions={field.suggestions}
      onPick={onChange}
    >
      {input}
    </TextSuggestions>
  );
}

/**
 * Wraps a text input with a round add button that opens a menu of ready-made
 * values. The field stays free-text — the menu is a shortcut, not a select.
 */
function TextSuggestions(
  props: Readonly<{
    label: string;
    suggestions: readonly string[];
    onPick: (value: string) => void;
    children: React.ReactNode;
  }>,
) {
  const { label, suggestions, onPick, children } = props;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape while the menu is open.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={isOpen ? "relative z-50" : "relative"}>
      {children}

      <button
        type="button"
        aria-label={`Choose a ${label}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-on-accent absolute top-1/2 right-3 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-colors"
      >
        <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="animate-popover-in border-ehs-border-ink/10 bg-ehs-surface absolute right-0 z-50 mt-1.5 w-52 origin-top-right overflow-hidden rounded-xl border py-1 shadow-(--ehs-shadow-popover)"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              role="menuitem"
              onClick={() => {
                onPick(suggestion);
                setIsOpen(false);
              }}
              className="hover:bg-ehs-light-bg/60 text-ehs-dark-bg flex w-full cursor-pointer items-center px-4 py-2.5 text-left transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DateControl(
  props: Readonly<{
    field: DateFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;
  const min = dateFieldMin(field);
  const max = dateFieldMax(field);

  // FieldShell already renders the label and the error, so this only supplies
  // the control. The schema speaks ISO; DateInput speaks MM/DD/YYYY.
  return (
    <DateInput
      id={field.name}
      label={field.label}
      hideLabel
      variant="embedded"
      value={isoToMmDdYyyy(value)}
      onChange={(next) => onChange(mmDdYyyyToIso(next))}
      minDate={min ? isoToMmDdYyyy(min) : undefined}
      maxDate={max ? isoToMmDdYyyy(max) : undefined}
      inputClassName={error ? errorRingClass : ""}
    />
  );
}

function TimeControl(
  props: Readonly<{
    field: TimeFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;
  return (
    <input
      id={field.name}
      name={field.name}
      type="time"
      value={value}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      onChange={(event) => onChange(event.target.value)}
      className={[inputClass, error ? errorRingClass : ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function SelectControl(
  props: Readonly<{
    field: SelectFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;

  // A native <select>'s popup cannot be styled. Use the glass listbox for
  // every enabled select so Status and the rest match the current dropdown UI.
  if (!field.disabled) {
    return (
      <SelectWithCustomControl
        field={field}
        value={value}
        invalid={Boolean(error)}
        onChange={onChange}
        triggerClassName={[inputClass, error ? errorRingClass : ""]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return (
    <div className="relative">
      <select
        id={field.name}
        name={field.name}
        value={value}
        disabled={field.disabled}
        onChange={(event) => onChange(event.target.value)}
        className={[
          inputClass,
          "appearance-none pr-9",
          value ? "" : "text-ehs-muted-text",
          field.disabled ? "cursor-not-allowed opacity-70" : "",
          error ? errorRingClass : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {field.placeholder ? (
          <option value="" disabled>
            {field.placeholder}
          </option>
        ) : null}
        {field.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-ehs-dark-bg"
          >
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        icon="mdi:chevron-down"
        className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}

function TextareaControl(
  props: Readonly<{
    field: TextareaFieldConfig;
    value: string;
    error?: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, error, onChange } = props;
  const hasAssistant = field.assistant !== undefined;

  const textarea = (
    <textarea
      id={field.name}
      name={field.name}
      value={value}
      rows={field.rows ?? 4}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={[
        // The controls variant reserves a strip along the bottom, so typed
        // text never runs underneath the in-field controls.
        hasAssistant
          ? FIELD_TEXTAREA_WITH_CONTROLS_CLASS
          : FIELD_TEXTAREA_CLASS,
        error ? errorRingClass : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  if (!field.assistant) {
    return textarea;
  }

  // `AiInFieldDraft` positions itself against this wrapper — it is absolute,
  // so without a positioned ancestor the ghost text escapes the field.
  // `z-0` keeps the in-field AI icons in this stacking context so they cannot
  // paint over an open select menu in a field above.
  return (
    <div className="relative z-0">
      {textarea}
      {field.assistant({ value, onChange })}
    </div>
  );
}

function ChipsControl(
  props: Readonly<{
    field: ChipsFieldConfig;
    value: string[];
    onChange: (v: string[]) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const [draft, setDraft] = useState("");
  const disabled = field.disabled ?? false;

  // Custom tags aren't in `options`, so surface them alongside the presets.
  const optionValues = new Set(field.options.map((option) => option.value));
  const customTags = value.filter((tag) => !optionValues.has(tag));
  const chips = [
    ...field.options,
    ...customTags.map((tag) => ({ value: tag, label: tag })),
  ];

  const toggle = (tag: string) => {
    if (disabled) return;
    onChange(
      value.includes(tag)
        ? value.filter((entry) => entry !== tag)
        : [...value, tag],
    );
  };

  const addDraft = () => {
    const tag = draft.trim();
    if (tag === "") return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => toggle(option.value)}
              className={[
                "text4 rounded-lg border px-3 py-1.5 transition-colors",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-dark-blue font-semibold"
                  : "text-ehs-gray border-ehs-border-ink/10 bg-ehs-surface hover:bg-ehs-surface-inverse/5",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {field.allowCustom && !disabled ? (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            placeholder={field.addCustomPlaceholder ?? "Add custom tag..."}
            aria-label={`Add a custom ${field.label}`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addDraft();
              }
            }}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={draft.trim() === ""}
            className="text4 bg-ehs-normal-blue/15 text-ehs-dark-blue hover:bg-ehs-normal-blue/25 shrink-0 cursor-pointer rounded-lg px-4 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Small removable badge for one pick inside {@link PersonMultiControl}. */
/**
 * Searchable multi-select dropdown for picking several people — same glass
 * listbox as {@link SelectWithCustomControl}, but toggling a row keeps the
 * menu open and every pick renders as a small badge underneath the trigger
 * instead of filling the trigger itself.
 */
function personMultiDisplayNamesKey(field: PersonMultiFieldConfig): string {
  return field.displayNamesField ?? `${field.name}Names`;
}

/**
 * The `person-multi` field: several people, stored as an array of user ids.
 *
 * Names are kept alongside the ids under `${name}Names` so a chip can be
 * labelled without a lookup. A form opened for editing usually arrives with ids
 * and no names — the mapper had no reason to carry them — so any id still
 * missing a name is resolved against the roster once, and the chip falls back
 * to "User 42" only if that fails too.
 */
/**
 * Multi-select over a fixed option list. `MultiSelectInput` supplies the
 * dropdown and the removable chips; `FieldShell` already renders the label and
 * error, so both are suppressed here as the other controls do.
 */
function SelectMultiControl(
  props: Readonly<{
    field: SelectMultiFieldConfig;
    value: string[];
    onChange: (v: string[]) => void;
  }>,
) {
  const { field, value, onChange } = props;

  return (
    <MultiSelectInput
      id={field.name}
      options={field.options}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder ?? "Select…"}
      disabled={field.disabled}
      wrapperClassName=""
      labelClassName="sr-only"
    />
  );
}

function PersonMultiControl(
  props: Readonly<{
    field: PersonMultiFieldConfig;
    value: string[];
    names: string[];
    onPatchValues: (patch: FormValues) => void;
  }>,
) {
  const { field, value, names, onPatchValues } = props;

  const namesKey = personMultiDisplayNamesKey(field);
  const source = field.usersSource ?? "site";
  const excludeSelfId = field.excludeSelf ? (getAuthContext()?.userId ?? 0) : 0;
  const excludeUserIds = [
    ...(field.excludeUserIds ?? []),
    ...(excludeSelfId > 0 ? [String(excludeSelfId)] : []),
  ];

  const unresolved = value.filter((id, index) => !names[index]);
  const lookup = useUserOptions({
    source,
    siteId: field.siteId ?? 0,
    query: "",
    enabled: unresolved.length > 0,
  });

  // `excludeUserIds` means "may not be in this list", not merely "may not be
  // offered in the dropdown". The excluded person can be chosen elsewhere
  // *after* they were picked here — the training trainer is exactly that — and
  // a rule that only filtered the options would leave them standing as a
  // selected chip. Filtering the rendered selection drops them the moment they
  // become excluded, and puts them back if that changes.
  const selected = value
    .map((id, index) => ({
      userId: id,
      name:
        names[index] ||
        lookup.users.find((user) => user.id === id)?.name ||
        `User ${id}`,
    }))
    .filter((entry) => !excludeUserIds.includes(entry.userId));

  return (
    <MultipleUsersPickerInput
      label={field.label}
      required={field.required}
      hideLabel
      value={selected}
      onChange={(next) => {
        onPatchValues({
          [field.name]: next.map((entry) => entry.userId),
          [namesKey]: next.map((entry) => entry.name),
        });
      }}
      source={source}
      siteId={field.siteId ?? 0}
      siteName={field.siteName}
      placeholder={field.placeholder ?? "Select people…"}
      allowFreeText={field.allowFreeText}
      excludeUserIds={excludeUserIds}
      maxSelected={field.maxSelected}
      disabled={field.disabled}
      variant="embedded"
    />
  );
}

const tileToneClass: Record<
  TileTone,
  Readonly<{ icon: string; base: string; selected: string }>
> = {
  positive: {
    icon: "text-ehs-green",
    base: "border-ehs-green/20 bg-ehs-green/5 hover:border-ehs-green/40",
    selected: "border-ehs-green bg-ehs-green/8",
  },
  warning: {
    icon: "text-ehs-yellow",
    base: "border-ehs-yellow/20 bg-ehs-yellow/5 hover:border-ehs-yellow/40",
    selected: "border-ehs-yellow bg-ehs-yellow/8",
  },
  neutral: {
    icon: "text-ehs-gray",
    base: "border-ehs-border-ink/10 bg-ehs-surface hover:border-ehs-border-ink/20",
    selected: "border-ehs-normal-blue bg-ehs-normal-blue/8",
  },
};

const tileColumnsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/** Compact equal-width toggle row used by edit observation and similar forms. */
function SegmentedTilesControl(
  props: Readonly<{
    field: TilesFieldConfig;
    value: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const disabled = field.disabled ?? false;

  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      className="flex h-10 w-full gap-2"
    >
      {field.options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              onChange(option.value);
            }}
            className={[
              "text4 flex h-full flex-1 items-center justify-center gap-2 rounded-lg border px-4 font-bold transition-colors",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              isSelected
                ? "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-normal-blue"
                : "border-ehs-border-ink/8 bg-ehs-surface/40 text-ehs-gray",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "size-2 shrink-0 rounded-full",
                isSelected ? "bg-ehs-normal-blue" : "bg-ehs-gray",
              ].join(" ")}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Figma priority group — muted track with solid teal selected pill. */
function SegmentedFillTilesControl(
  props: Readonly<{
    field: TilesFieldConfig;
    value: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, onChange } = props;

  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      className="rounded-2.5 bg-ehs-surface-raised border-ehs-border-ink/8 flex w-full items-stretch gap-0.5 border p-1"
    >
      {field.options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              onChange(option.value);
            }}
            className={[
              "text4 rounded-1.5 flex min-w-0 flex-1 cursor-pointer items-center justify-center py-2 leading-normal transition-colors",
              isSelected
                ? "bg-ehs-normal-blue text-ehs-on-accent font-semibold"
                : "text-ehs-gray hover:bg-ehs-surface/70 font-medium",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** CAPA effectiveness assessment — large equal cards (Figma 846:6092). */
function AssessmentTilesControl(
  props: Readonly<{
    field: TilesFieldConfig;
    value: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, onChange } = props;

  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {field.options.map((option) => {
        const isSelected = value === option.value;
        const isPositive = option.tone === "positive";

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              onChange(option.value);
            }}
            className={[
              "text4 flex h-13.5 cursor-pointer items-center justify-center rounded-2xl border px-3 text-center leading-5 font-medium transition-colors",
              isSelected && isPositive
                ? "border-ehs-green text-ehs-green bg-[rgba(123,241,168,0.12)]"
                : isSelected
                  ? "border-ehs-normal-blue bg-ehs-normal-blue/8 text-ehs-normal-blue"
                  : "text-ehs-gray hover:bg-ehs-surface/50 border-ehs-border-ink/10 bg-transparent",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Single-choice cards: bigger tap targets than a select, with an icon each. */
function TilesControl(
  props: Readonly<{
    field: TilesFieldConfig;
    value: string;
    onChange: (v: string) => void;
  }>,
) {
  const { field, value, onChange } = props;

  if (field.variant === "segmented") {
    return (
      <SegmentedTilesControl field={field} value={value} onChange={onChange} />
    );
  }

  if (field.variant === "segmented-fill") {
    return (
      <SegmentedFillTilesControl
        field={field}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (field.variant === "assessment") {
    return (
      <AssessmentTilesControl field={field} value={value} onChange={onChange} />
    );
  }

  const columns = tileColumnsClass[field.columns ?? 2];

  return (
    <div
      role="radiogroup"
      aria-label={field.label}
      className={["grid grid-cols-1 gap-3", columns].join(" ")}
    >
      {field.options.map((option) => {
        const isSelected = value === option.value;
        const tone = tileToneClass[option.tone ?? "neutral"];

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              onChange(option.value);
            }}
            className={[
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-6 text-center transition-colors",
              isSelected ? tone.selected : tone.base,
            ].join(" ")}
          >
            {option.icon ? (
              <Icon
                icon={option.icon}
                className={`size-7 ${tone.icon}`}
                aria-hidden="true"
              />
            ) : null}

            <span className="text4 text-ehs-darker font-bold">
              {option.label}
            </span>

            {option.description ? (
              <span className="text8 text-ehs-muted-text">
                {option.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const checkboxColumnsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

function CheckboxGroupControl(
  props: Readonly<{
    field: CheckboxGroupFieldConfig;
    value: string[];
    onChange: (v: string[]) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const isRows = field.variant === "rows";
  const columns = checkboxColumnsClass[field.columns ?? (isRows ? 1 : 2)];

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div
      className={["grid grid-cols-1", isRows ? "gap-3" : "gap-2", columns].join(
        " ",
      )}
    >
      {field.options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={[
              // Was a flat bg-ehs-light-bg/40 slab with no border and no
              // row-level selected state, so a group of these read as grey
              // bars and the only feedback was the 16px box. Now frosted like
              // every other control, and the whole row responds.
              "text4 rounded-2.5 flex cursor-pointer items-center gap-2.5 border px-3 py-2.5 transition-colors",
              checked
                ? "border-ehs-normal-blue/40 bg-ehs-light-blue/70 text-ehs-darker font-medium"
                : "text-ehs-gray backdrop-blur-1.25 bg-ehs-surface/55 hover:bg-ehs-surface/75 border-ehs-border-ink/8 hover:border-ehs-border-ink/18",
            ].join(" ")}
          >
            <input
              type="checkbox"
              name={field.name}
              value={option.value}
              checked={checked}
              onChange={() => toggle(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={[
                "flex shrink-0 items-center justify-center rounded border transition-colors",
                isRows ? "size-3.25" : "size-4",
                checked
                  ? "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-on-accent"
                  : isRows
                    ? "border-ehs-border-ink/12 bg-ehs-surface/62"
                    : "border-ehs-border-strong bg-ehs-surface/70",
              ].join(" ")}
            >
              {checked ? (
                <Icon
                  icon="mdi:check"
                  className={isRows ? "size-4" : "size-3"}
                />
              ) : null}
            </span>
            <span
              className={
                isRows
                  ? "text4 text-ehs-darker font-medium"
                  : "text4 text-ehs-gray font-medium"
              }
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function SwitchControl(
  props: Readonly<{
    field: SwitchFieldConfig;
    value: string;
    onChange: (value: FieldValue) => void;
  }>,
) {
  const { field, value, onChange } = props;
  const checked = value === "true";

  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={field.name}
        className="text8 text-ehs-gray font-semibold tracking-[0.24px]"
      >
        {field.label}
        {field.required ? <span className="text-ehs-red"> *</span> : null}
      </label>
      <Toggle
        id={field.name}
        checked={checked}
        aria-label={field.label}
        onChange={(next) => {
          onChange(next ? "true" : "false");
        }}
      />
    </div>
  );
}

function personDisplayNameKey(field: PersonFieldConfig): string {
  return field.displayNameField ?? `${field.name}Name`;
}

function PersonControl(
  props: Readonly<{
    field: PersonFieldConfig;
    userId: string;
    displayName: string;
    error?: string;
    onPatchValues: (patch: FormValues) => void;
  }>,
) {
  const { field, userId, displayName, error, onPatchValues } = props;
  const nameKey = personDisplayNameKey(field);
  const excludeSelfId = field.excludeSelf ? (getAuthContext()?.userId ?? 0) : 0;
  const excludeUserIds =
    excludeSelfId > 0 ? [String(excludeSelfId)] : undefined;

  if (field.disabled) {
    return (
      <FieldShell field={field} error={error}>
        <input
          id={field.name}
          name={field.name}
          type="text"
          value={displayName}
          disabled
          readOnly
          aria-label={field.label}
          className={`${FIELD_INPUT_CLASS} cursor-not-allowed opacity-70`}
        />
        <input type="hidden" name={field.name} value={userId} />
      </FieldShell>
    );
  }

  return (
    <FieldShell field={field} error={error} showMessages>
      <UserPickerInput
        label={field.label}
        required={field.required}
        hideLabel
        value={{ userId, name: displayName }}
        onChange={(next) => {
          onPatchValues({
            [field.name]: next.userId,
            [nameKey]: next.name,
          });
        }}
        source={field.usersSource ?? "site"}
        siteId={field.siteId ?? 0}
        siteName={field.siteName}
        trailingHint={field.trailingHint}
        placeholder={field.placeholder ?? "Start typing a name…"}
        variant="embedded"
        excludeUserIds={excludeUserIds}
        allowFreeText={field.allowFreeText}
      />
    </FieldShell>
  );
}

export function FieldRenderer(props: FieldRendererProps) {
  const { field, value, values, error, onChange, onPatchValues } = props;

  switch (field.type) {
    case "text":
      return (
        <FieldShell
          field={field}
          error={error}
          trailing={
            field.maxLength ? (
              <CharacterCount
                value={value as string}
                maxLength={field.maxLength}
              />
            ) : null
          }
        >
          <TextControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "date":
      return (
        <FieldShell field={field} error={error}>
          <DateControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "time":
      return (
        <FieldShell field={field} error={error}>
          <TimeControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "select":
      return (
        <FieldShell field={field} error={error}>
          <SelectControl
            field={field}
            value={value as string}
            error={error}
            onChange={(next) => {
              onChange(next);
              field.onSelectChange?.(next, onPatchValues);
            }}
          />
        </FieldShell>
      );
    case "textarea":
      return (
        <FieldShell
          field={field}
          error={error}
          trailing={
            field.maxLength ? (
              <CharacterCount
                value={value as string}
                maxLength={field.maxLength}
              />
            ) : null
          }
        >
          <TextareaControl
            field={field}
            value={value as string}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "select-multi":
      return (
        <FieldShell field={field} error={error}>
          <SelectMultiControl
            field={field}
            value={value as string[]}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "chips":
      return (
        <FieldShell field={field} error={error}>
          <ChipsControl
            field={field}
            value={value as string[]}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "person-multi": {
      const namesKey = personMultiDisplayNamesKey(field);
      return (
        <FieldShell field={field} error={error}>
          <PersonMultiControl
            field={field}
            value={value as string[]}
            names={(values[namesKey] as string[] | undefined) ?? []}
            onPatchValues={onPatchValues}
          />
        </FieldShell>
      );
    }
    case "photo":
      return (
        <FieldShell
          field={field}
          error={error}
          showMessages={false}
          hideLabel={field.hideLabel === true || field.label.trim() === ""}
        >
          <PhotoUploadControl
            field={field}
            value={value as string[]}
            error={error}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "checkbox-group":
      return (
        <FieldShell field={field} error={error}>
          <CheckboxGroupControl
            field={field}
            value={value as string[]}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "tiles":
      return (
        <FieldShell field={field} error={error} hideLabel={field.hideLabel}>
          <TilesControl
            field={field}
            value={value as string}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "switch":
      return (
        <FieldShell field={field} error={error} hideLabel>
          <SwitchControl
            field={field}
            value={value as string}
            onChange={onChange}
          />
        </FieldShell>
      );
    case "heading":
      return (
        <div className="border-ehs-border-ink/8 border-b pt-1 pb-2.5">
          <p className="text-ehs-dark-bg text-sm font-bold">{field.label}</p>
        </div>
      );
    case "custom":
      return <>{field.render}</>;
    case "person": {
      const nameKey = personDisplayNameKey(field);
      const displayName = String(values[nameKey] ?? "");
      return (
        <PersonControl
          field={field}
          userId={value as string}
          displayName={displayName}
          error={error}
          onPatchValues={onPatchValues}
        />
      );
    }
    default: {
      // Exhaustiveness guard — a new field type must be handled above.
      const _never: never = field;
      return _never;
    }
  }
}
