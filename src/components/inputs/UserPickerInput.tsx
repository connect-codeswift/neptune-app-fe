"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  FieldError,
  FieldHint,
  FieldLabel,
} from "@/components/ui/field-primitives";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { UserOptionList } from "@/components/inputs/UserOptionList";
import {
  UserPickerMenu,
  type UserPickerVariant,
} from "@/components/inputs/UserPickerMenu";
import type { UserOption } from "@/components/inputs/user-option";
import { useOptionHighlight } from "@/components/inputs/use-option-highlight";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import {
  useUserOptions,
  type UserOptionsSource,
} from "@/hooks/use-user-options";

/**
 * A chosen person. `userId` is `""` when the name was typed rather than picked
 * — the distinction the whole `allowFreeText` rule turns on.
 */
export type UserPickerValue = Readonly<{
  userId: string;
  name: string;
}>;

export const EMPTY_USER_PICKER_VALUE: UserPickerValue = {
  userId: "",
  name: "",
};

export type UserPickerInputProps = Readonly<{
  label: string;
  value: UserPickerValue;
  /**
   * `user` is the full record for a picked person and `null` for typed text, so
   * a caller that needs more than a name and an id — the incident form reads
   * `gender` to decide which injury questions to ask — gets it without a
   * second request.
   */
  onChange: (next: UserPickerValue, user: UserOption | null) => void;
  /** `site` (default) searches the site roster; `org` searches everyone. */
  source?: UserOptionsSource;
  siteId?: number;
  siteName?: string | null;
  required?: boolean;
  placeholder?: string;
  trailingHint?: string;
  /**
   * Keep a typed name that matches nobody. Off by default: most fields file a
   * `userId` the backend needs. The incident report turns it on, because a
   * contractor or visitor with no account is exactly the person you most need
   * recorded.
   */
  allowFreeText?: boolean;
  excludeUserIds?: readonly string[];
  filter?: (user: UserOption) => boolean;
  disabled?: boolean;
  error?: string | null;
  /** Page forms use `form`; controls inside a modal need `embedded`. */
  variant?: UserPickerVariant;
  /** Omit the built-in label — FormBuilder already renders one. */
  hideLabel?: boolean;
  className?: string;
  inputClassName?: string;
}>;

/**
 * Pick one person, from the current site's roster or the whole organization.
 *
 * This is the single-select half of the app's user picking. It replaced four
 * separate comboboxes that had each grown their own debounce, keyboard handling
 * and empty states; see `MultipleUsersPickerInput` for the other half and
 * `use-user-options` for where the people come from.
 */
export function UserPickerInput(props: Readonly<UserPickerInputProps>) {
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
    filter,
    disabled = false,
    error = null,
    variant = "form",
    hideLabel = false,
    className = "",
    inputClassName = "",
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

  // Nothing is fetched until the menu opens: most fields on a long form are
  // never touched, and a roster nobody asked to see is a wasted request.
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

  function select(user: UserOption) {
    onChange({ userId: user.id, name: user.name }, user);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function clear() {
    onChange(EMPTY_USER_PICKER_VALUE, null);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function pickHighlighted(index: number): boolean {
    const user = options.users[index];
    if (!user) {
      return false;
    }

    select(user);
    return true;
  }

  const hasSelection = value.userId !== "";
  const rosterName = siteName ?? "this site";

  const menu = (
    <UserPickerMenu
      open={open}
      variant={variant}
      anchorRef={anchorRef}
      menuRef={menuRef}
      contentKey={`${options.resultsKey}:${String(options.users.length)}`}
    >
      <UserOptionList
        listboxId={listboxId}
        label={isOrg ? "People" : `People at ${rosterName}`}
        heading={isOrg || !siteName ? null : `People at ${siteName}`}
        users={options.users}
        selectedIds={hasSelection ? [value.userId] : []}
        activeIndex={activeIndex}
        onHighlight={setActiveIndex}
        onSelect={select}
        isLoading={options.isLoading}
        isError={options.isError}
        hasNoSite={options.hasNoSite}
        query={options.debouncedQuery}
        messages={singleSelectMessages(isOrg, rosterName, allowFreeText)}
      />
    </UserPickerMenu>
  );

  const control = (
    <div ref={anchorRef} className="relative min-w-0">
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
        value={value.name}
        placeholder={placeholder}
        onChange={(event) => {
          const text = event.target.value;
          setQuery(text);
          setOpen(true);
          // Typing over a picked name breaks the link to that account — the id
          // must not survive the text it stood for.
          onChange({ userId: "", name: text }, null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!allowFreeText && !hasSelection && value.name !== "") {
            onChange(EMPTY_USER_PICKER_VALUE, null);
            setQuery("");
          }
        }}
        onKeyDown={(event) => {
          handleKeyDown(event, { open, setOpen, onEnter: pickHighlighted });
        }}
        className={[
          inputClassName || FIELD_INPUT_CLASS,
          "border-ehs-border-ink/10 border",
          hasSelection ? "pr-16" : "pr-9",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
        {hasSelection ? (
          <MatchedUserAdornment label={label} onClear={clear} />
        ) : (
          <Icon
            icon={options.isSearching ? "mdi:loading" : "mdi:magnify"}
            className={[
              "text-ehs-muted-text pointer-events-none size-3.75",
              options.isSearching
                ? "animate-spin motion-reduce:animate-none"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />
        )}
      </div>

      {isEmbedded ? null : menu}
    </div>
  );

  if (isEmbedded) {
    return (
      <div
        className={[
          "flex min-w-0 flex-col",
          hideLabel ? "" : "gap-1.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {hideLabel ? null : (
          <label
            htmlFor={fieldId}
            className="block text-base leading-[19.5px] font-medium"
          >
            {label}
            {required ? <span className="text-ehs-red"> *</span> : null}
          </label>
        )}

        <div ref={rootRef} className="relative min-w-0">
          {control}
        </div>
        {menu}
      </div>
    );
  }

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

      {trailingHint && !error ? <FieldHint>{trailingHint}</FieldHint> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function MatchedUserAdornment(
  props: Readonly<{ label: string; onClear: () => void }>,
) {
  const { label, onClear } = props;

  return (
    <>
      <span
        title="Matched to a user account"
        className="bg-ehs-light-blue text-ehs-dark-blue inline-flex size-4.5 items-center justify-center rounded-full"
      >
        <Icon icon="mdi:account-check" className="size-3" aria-hidden="true" />
      </span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${label.toLowerCase()}`}
        className="text-ehs-muted-text hover:text-ehs-darker inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
      >
        <Icon icon="mdi:close" className="size-3.5" aria-hidden="true" />
      </button>
    </>
  );
}

/**
 * Empty and error copy. It tells the user what happens to what they typed, so
 * it has to know whether typed names survive.
 */
function singleSelectMessages(
  isOrg: boolean,
  rosterName: string,
  allowFreeText: boolean,
) {
  const keptOrNot = allowFreeText
    ? "Your typed name is kept as-is."
    : "Pick someone from the list.";
  const where = isOrg ? "" : ` at ${rosterName}`;

  return {
    noSite:
      "Your sign-in isn't linked to a site, so there's no roster to search.",
    loadError: `Couldn't load people${where}. Try again in a moment.`,
    emptyNoQuery: isOrg
      ? "No people are listed yet."
      : `No people are listed for ${rosterName} yet.`,
    emptyWithQuery: (query: string) =>
      `No one${where} matches “${query}”. ${keptOrNot}`,
  };
}
