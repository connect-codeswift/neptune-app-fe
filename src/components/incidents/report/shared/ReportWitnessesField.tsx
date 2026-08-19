"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ReportFieldLabel } from "@/components/incidents/report/shared/ReportFormField";
import type { SiteUserDto } from "@/dtos/res/user-response.dto";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import { useSiteUsersQuery } from "@/hooks/use-user-queries";

/** Long enough that a name typed at speed is one request, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 300;

export type ReportWitnessesFieldProps = Readonly<{
  label: string;
  trailingHint?: string;
  placeholder?: string;
  /** Comma-separated witness names — same shape the report mapper expects. */
  value: string;
  onChange: (witnesses: string) => void;
  siteId: number;
  siteName?: string | null;
  className?: string;
}>;

function displayNameFor(user: SiteUserDto): string {
  return (
    user.fullName?.trim() || user.email?.trim() || `User ${String(user.id)}`
  );
}

function secondaryLineFor(user: SiteUserDto): string {
  const email = user.email?.trim();
  const role = user.roleName?.trim().replaceAll("_", " ");

  return [email, role].filter(Boolean).join(" · ");
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
}

function parseWitnessNames(value: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const entry of value.split(",")) {
    const name = entry.trim();
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    names.push(name);
  }

  return names;
}

function joinWitnessNames(names: readonly string[]): string {
  return names.join(", ");
}

/**
 * Witness picker: search site roster (`GET /api/v1/sites/{siteId}/users`),
 * same source as the affected-person field, with multi-select chips.
 *
 * Free-typed names can still be added with Enter when no roster row is
 * highlighted — visitors and contractors may not appear in the roster.
 */
export function ReportWitnessesField(
  props: Readonly<ReportWitnessesFieldProps>,
) {
  const {
    label,
    trailingHint,
    placeholder,
    value,
    onChange,
    siteId,
    siteName,
    className = "",
  } = props;

  const selectedNames = useMemo(() => parseWitnessNames(value), [value]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlight, setHighlight] = useState<Readonly<{
    resultsKey: string;
    index: number;
  }> | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const listboxId = `${fieldId}-listbox`;

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  const usersQuery = useSiteUsersQuery(
    siteId,
    { search: debouncedQuery },
    open,
  );
  const users = usersQuery.data ?? [];

  const isSearching =
    open && (usersQuery.isFetching || debouncedQuery !== query);

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const resultsKey = `${debouncedQuery}:${String(usersQuery.dataUpdatedAt)}`;
  const activeIndex =
    highlight?.resultsKey === resultsKey ? highlight.index : -1;

  function moveHighlight(index: number) {
    setHighlight({ resultsKey, index });
  }

  function addWitness(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const next = [...selectedNames];
    const exists = next.some(
      (entry) => entry.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      next.push(trimmed);
      onChange(joinWitnessNames(next));
    }

    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function removeWitness(name: string) {
    const key = name.toLowerCase();
    onChange(
      joinWitnessNames(
        selectedNames.filter((entry) => entry.toLowerCase() !== key),
      ),
    );
  }

  function select(user: SiteUserDto) {
    addWitness(displayNameFor(user));
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Backspace" && query === "" && selectedNames.length > 0) {
      removeWitness(selectedNames.at(-1)!);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      if (users.length === 0) {
        return;
      }

      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = activeIndex + delta;
      moveHighlight(
        next < 0 ? users.length - 1 : next >= users.length ? 0 : next,
      );
      return;
    }

    if (event.key === "Enter" && open) {
      const user = users[activeIndex];
      if (user) {
        event.preventDefault();
        select(user);
        return;
      }

      if (query.trim()) {
        event.preventDefault();
        addWitness(query);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={["relative flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ReportFieldLabel
        label={label}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-xs">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />

      <div className="relative">
        <div
          role="group"
          aria-labelledby={fieldId}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          className={[
            "rounded-2.5 border-ehs-border-ink/8 flex min-h-9 w-full flex-wrap items-center gap-1.5 border",
            "backdrop-blur-1.25 bg-ehs-surface/[0.62] px-3.25 py-1.5 pr-9",
            "transition-[color,background-color,border-color,box-shadow] duration-150",
            "hover:border-ehs-border-ink/18 hover:bg-ehs-surface/[0.78]",
            open
              ? "border-ehs-normal-blue ring-0.75 ring-ehs-normal-blue/[0.15]"
              : "focus-within:border-ehs-normal-blue focus-within:ring-0.75 focus-within:ring-ehs-normal-blue/[0.15]",
          ].join(" ")}
        >
          {selectedNames.map((name) => (
            <span
              key={name.toLowerCase()}
              className="border-ehs-border bg-ehs-light-bg text-ehs-darker text-3.25 inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 font-medium"
            >
              <span className="truncate">{name}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeWitness(name);
                }}
                aria-label={`Remove witness ${name}`}
                className="text-ehs-muted-text hover:text-ehs-darker inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
              >
                <Icon
                  icon="mdi:close"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            id={fieldId}
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${listboxId}-option-${String(activeIndex)}`
                : undefined
            }
            value={query}
            placeholder={
              placeholder ??
              (selectedNames.length > 0
                ? "Add another…"
                : "Search people at your site…")
            }
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
          icon={isSearching ? "mdi:loading" : "mdi:magnify"}
          className={[
            "text-ehs-muted-text pointer-events-none absolute top-2.5 right-2.5 size-3.75",
            isSearching ? "animate-spin motion-reduce:animate-none" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />

        {open ? (
          <div className="animate-popover-in rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden border shadow-(--ehs-shadow-popover)">
            {siteName ? (
              <p className="text-ehs-muted-text border-ehs-border text-2.5 truncate border-b px-3 pt-2 pb-1.5 font-semibold tracking-wider uppercase">
                People at {siteName}
              </p>
            ) : null}

            <ul
              id={listboxId}
              role="listbox"
              aria-label={`Witnesses at ${siteName ?? "this site"}`}
              aria-multiselectable="true"
              className="max-h-56 overflow-y-auto p-1"
            >
              {siteId <= 0 ? (
                <li className="text-ehs-muted-text text-3.25 px-2.5 py-3">
                  Your sign-in isn&apos;t linked to a site, so there&apos;s no
                  roster to search. Press Enter to add a typed name.
                </li>
              ) : usersQuery.isLoading ? (
                <li className="flex flex-col gap-1 p-1.5">
                  {[0, 1, 2].map((row) => (
                    <span
                      key={row}
                      className="rounded-2 bg-ehs-surface-inverse/6 h-10 animate-pulse"
                    />
                  ))}
                </li>
              ) : usersQuery.isError ? (
                <li className="text-ehs-muted-text text-3.25 px-2.5 py-3">
                  Couldn&apos;t load people for this site. Press Enter to add a
                  typed name, or try again in a moment.
                </li>
              ) : users.length === 0 ? (
                <li className="text-ehs-muted-text text-3.25 px-2.5 py-3">
                  {debouncedQuery.trim()
                    ? `No one at ${siteName ?? "this site"} matches “${debouncedQuery.trim()}”. Press Enter to keep that name.`
                    : `No people are listed for ${siteName ?? "this site"} yet.`}
                </li>
              ) : (
                users.map((user, index) => {
                  const name = displayNameFor(user);
                  const secondary = secondaryLineFor(user);
                  const isSelected = selectedNames.some(
                    (entry) => entry.toLowerCase() === name.toLowerCase(),
                  );
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={user.id}
                      id={`${listboxId}-option-${String(index)}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        disabled={isSelected}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          if (!isSelected) {
                            select(user);
                          }
                        }}
                        onMouseEnter={() => moveHighlight(index)}
                        className={[
                          "rounded-2 flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors",
                          isSelected
                            ? "cursor-default opacity-60"
                            : "hover:bg-ehs-surface-inverse/4 cursor-pointer",
                          isActive && !isSelected
                            ? "bg-ehs-normal-blue/10"
                            : "",
                        ].join(" ")}
                      >
                        <span className="bg-ehs-light-blue text-ehs-dark-blue text-2.75 inline-flex size-7 shrink-0 items-center justify-center rounded-full font-bold">
                          {initialsFor(name)}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-ehs-dark-bg truncate text-[14px] font-semibold">
                            {name}
                          </span>
                          {secondary ? (
                            <span className="text-ehs-muted-text truncate text-[12px]">
                              {secondary}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <Icon
                            icon="mdi:check"
                            className="text-ehs-dark-blue size-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
