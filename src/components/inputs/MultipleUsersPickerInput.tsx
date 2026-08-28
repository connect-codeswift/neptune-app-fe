"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@iconify/react";
import {
  FieldError,
  FieldHint,
  FieldLabel,
} from "@/components/ui/field-primitives";
import { UserOptionList } from "@/components/inputs/UserOptionList";
import {
  UserPickerMenu,
  type UserPickerVariant,
} from "@/components/inputs/UserPickerMenu";
import { isSameName, type UserOption } from "@/components/inputs/user-option";
import { useOptionHighlight } from "@/components/inputs/use-option-highlight";
import type { UserPickerValue } from "@/components/inputs/UserPickerInput";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import {
  useUserOptions,
  type UserOptionsSource,
} from "@/hooks/use-user-options";

export type MultipleUsersPickerInputProps = Readonly<{
  label: string;
  value: readonly UserPickerValue[];
  /**
   * `users` carries the full record for every pick that came from the roster,
   * and omits free-typed entries, which have no record to carry.
   */
  onChange: (
    next: readonly UserPickerValue[],
    users: readonly UserOption[],
  ) => void;
  source?: UserOptionsSource;
  siteId?: number;
  siteName?: string | null;
  required?: boolean;
  placeholder?: string;
  trailingHint?: string;
  /** Accept a typed name that matches nobody, on Enter. Off by default. */
  allowFreeText?: boolean;
  excludeUserIds?: readonly string[];
  /** Names refused as well as ids — for people who were typed, not picked. */
  excludeNames?: readonly string[];
  filter?: (user: UserOption) => boolean;
  maxSelected?: number;
  disabled?: boolean;
  error?: string | null;
  variant?: UserPickerVariant;
  hideLabel?: boolean;
  className?: string;
}>;

/**
 * Pick several people — witnesses on an incident, attendees at a training
 * session, the personnel authorized on a lockout.
 *
 * Deliberately a separate component from `UserPickerInput` rather than a `mode`
 * prop on it. A single-select owns one text value and a blur rule; a
 * multi-select owns a chip list, a per-row toggle and a Backspace rule. Sharing
 * the shell would mean every consumer reading props that cannot apply to it and
 * every branch inside asking which half it was in. What they do share —
 * fetching, filtering, the listbox, the menu, the highlight — they share by
 * module, not by flag.
 */
export function MultipleUsersPickerInput(
  props: Readonly<MultipleUsersPickerInputProps>,
) {
  const {
    label,
    value,
    onChange,
    source = "site",
    siteId = 0,
    siteName,
    required = false,
    placeholder,
    trailingHint,
    allowFreeText = false,
    excludeUserIds,
    excludeNames,
    filter,
    maxSelected,
    disabled = false,
    error = null,
    variant = "embedded",
    hideLabel = false,
    className = "",
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const listboxId = `${fieldId}-listbox`;

  const isEmbedded = variant === "embedded";
  const isOrg = source === "org";
  const isFull = maxSelected !== undefined && value.length >= maxSelected;

  const options = useUserOptions({
    source,
    siteId,
    query,
    enabled: open && !disabled,
    exclude: excludeUserIds,
    filter,
  });

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false), menuRef);

  const { activeIndex, setActiveIndex, handleKeyDown } = useOptionHighlight(
    options.resultsKey,
    options.users.length,
  );

  const selectedIds = value.map((entry) => entry.userId).filter(Boolean);

  // Every person ever picked in this field, so `onChange` can hand back full
  // records for people who are no longer in the loaded page of results. Looking
  // them up in `options.users` instead would silently drop a pick as soon as the
  // search term moved on from it.
  const knownUsers = useRef(new Map<string, UserOption>());

  function isExcludedName(name: string): boolean {
    return (excludeNames ?? []).some((excluded) => isSameName(excluded, name));
  }

  function has(entry: UserPickerValue): boolean {
    return value.some((current) =>
      current.userId && entry.userId
        ? current.userId === entry.userId
        : isSameName(current.name, entry.name),
    );
  }

  function commit(next: readonly UserPickerValue[]) {
    // Only roster picks have a record to hand back; free-typed names don't.
    const picked = next
      .map((entry) => knownUsers.current.get(entry.userId))
      .filter((user): user is UserOption => user !== undefined);

    onChange(next, picked);
  }

  function add(entry: UserPickerValue, user?: UserOption) {
    if (!entry.name.trim() || isExcludedName(entry.name) || isFull) {
      return;
    }

    if (user) {
      knownUsers.current.set(user.id, user);
    }

    if (!has(entry)) {
      commit([...value, entry]);
    }

    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function remove(entry: UserPickerValue) {
    commit(value.filter((current) => current !== entry));
  }

  function toggle(user: UserOption) {
    const existing = value.find(
      (current) =>
        current.userId === user.id || isSameName(current.name, user.name),
    );

    if (existing) {
      remove(existing);
      inputRef.current?.focus();
      return;
    }

    add({ userId: user.id, name: user.name }, user);
  }

  function pickHighlighted(index: number): boolean {
    const user = options.users[index];
    if (user) {
      toggle(user);
      return true;
    }

    if (allowFreeText && query.trim()) {
      add({ userId: "", name: query.trim() });
      return true;
    }

    return false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Backspace on an empty box removes the last chip — the standard token-field
    // gesture, and the only way back out of a chip without reaching for a mouse.
    if (event.key === "Backspace" && query === "" && value.length > 0) {
      const last = value.at(-1);
      if (last) {
        remove(last);
      }
      return;
    }

    handleKeyDown(event, { open, setOpen, onEnter: pickHighlighted });
  }

  const rosterName = siteName ?? "this site";

  const menu = (
    <UserPickerMenu
      open={open}
      variant={variant}
      anchorRef={anchorRef}
      menuRef={menuRef}
    >
      <UserOptionList
        listboxId={listboxId}
        label={isOrg ? "People" : `People at ${rosterName}`}
        heading={isOrg || !siteName ? null : `People at ${siteName}`}
        users={options.users}
        selectedIds={selectedIds}
        activeIndex={activeIndex}
        onHighlight={setActiveIndex}
        onSelect={toggle}
        isLoading={options.isLoading}
        isError={options.isError}
        hasNoSite={options.hasNoSite}
        query={options.debouncedQuery}
        messages={multiSelectMessages(isOrg, rosterName, allowFreeText)}
      />
    </UserPickerMenu>
  );

  const control = (
    <div ref={anchorRef} className="relative">
      <div
        role="group"
        aria-labelledby={fieldId}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={[
          "rounded-2.5 border-ehs-border-ink/8 flex min-h-9 w-full flex-wrap items-center gap-1.5 border",
          "backdrop-blur-1.25 bg-ehs-surface/[0.62] px-3.25 py-1.5 pr-9",
          "transition-[color,background-color,border-color,box-shadow] duration-150",
          "hover:border-ehs-border-ink/18 hover:bg-ehs-surface/[0.78]",
          disabled ? "cursor-not-allowed opacity-60" : "",
          open
            ? "border-ehs-normal-blue ring-0.75 ring-ehs-normal-blue/[0.15]"
            : "focus-within:border-ehs-normal-blue focus-within:ring-0.75 focus-within:ring-ehs-normal-blue/[0.15]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value.map((entry) => (
          <SelectedUserChip
            key={entry.userId || entry.name.toLowerCase()}
            entry={entry}
            disabled={disabled}
            onRemove={() => remove(entry)}
          />
        ))}

        <input
          ref={inputRef}
          id={fieldId}
          role="combobox"
          autoComplete="off"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${String(activeIndex)}`
              : undefined
          }
          aria-invalid={error ? true : undefined}
          value={query}
          placeholder={placeholderFor(placeholder, value.length, isFull)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-28 flex-1 border-0 bg-transparent py-0.5 text-sm outline-none"
        />
      </div>

      <Icon
        icon={options.isSearching ? "mdi:loading" : "mdi:magnify"}
        className={[
          "text-ehs-muted-text pointer-events-none absolute top-2.5 right-2.5 size-3.75",
          options.isSearching ? "animate-spin motion-reduce:animate-none" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />

      {isEmbedded ? null : menu}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      data-field-error={error ? "true" : undefined}
    >
      {hideLabel ? null : <FieldLabel label={label} required={required} />}

      {control}
      {isEmbedded ? menu : null}

      {trailingHint && !error ? <FieldHint>{trailingHint}</FieldHint> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function SelectedUserChip(
  props: Readonly<{
    entry: UserPickerValue;
    disabled: boolean;
    onRemove: () => void;
  }>,
) {
  const { entry, disabled, onRemove } = props;

  return (
    <span className="border-ehs-border bg-ehs-light-bg text-ehs-darker inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-sm font-medium">
      <span className="truncate">{entry.name}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${entry.name}`}
        className="text-ehs-muted-text hover:text-ehs-darker inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed"
      >
        <Icon icon="mdi:close" className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

function placeholderFor(
  placeholder: string | undefined,
  count: number,
  isFull: boolean,
): string {
  if (isFull) {
    return "";
  }

  if (count > 0) {
    return "Add another…";
  }

  return placeholder ?? "Search people…";
}

function multiSelectMessages(
  isOrg: boolean,
  rosterName: string,
  allowFreeText: boolean,
) {
  const fallback = allowFreeText
    ? "Press Enter to add that name anyway."
    : "Try a different spelling.";
  const where = isOrg ? "" : ` at ${rosterName}`;

  return {
    noSite: allowFreeText
      ? "Your sign-in isn't linked to a site, so there's no roster to search. Press Enter to add a typed name."
      : "Your sign-in isn't linked to a site, so there's no roster to search.",
    loadError: `Couldn't load people${where}. Try again in a moment.`,
    emptyNoQuery: isOrg
      ? "No people are listed yet."
      : `No people are listed for ${rosterName} yet.`,
    emptyWithQuery: (query: string) =>
      `No one${where} matches “${query}”. ${fallback}`,
  };
}
