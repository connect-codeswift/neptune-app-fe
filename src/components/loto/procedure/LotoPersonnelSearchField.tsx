"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { LotoPersonnelSelection } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import { useSiteUsersQuery } from "@/hooks/use-user-queries";
import { getCurrentUser } from "@/lib/current-user";

const SEARCH_DEBOUNCE_MS = 300;

function displayNameFor(
  user: Readonly<{
    fullName?: string | null;
    email?: string | null;
    id: number;
  }>,
): string {
  return (
    user.fullName?.trim() || user.email?.trim() || `User ${String(user.id)}`
  );
}

export type LotoPersonnelSearchFieldProps = Readonly<{
  value: readonly LotoPersonnelSelection[];
  onChange: (next: LotoPersonnelSelection[]) => void;
  error?: string | null;
}>;

/**
 * Multi-select authorized-personnel picker for the create/edit procedure form
 * — a combobox over GET /api/Auth/GetUsersBySiteId/{siteId}?search=. Any
 * registered, active user on the site is eligible, not just workers.
 */
export function LotoPersonnelSearchField(
  props: Readonly<LotoPersonnelSearchFieldProps>,
) {
  const { value, onChange, error = null } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const siteId = getCurrentUser().siteId;

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
  const selectedIds = new Set(value.map((person) => person.userId));
  const users = (usersQuery.data ?? []).filter(
    (user) => !user.isInvited && !user.isDrop && !selectedIds.has(user.id),
  );

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const isSearching =
    open && (usersQuery.isFetching || debouncedQuery !== query);

  function addPerson(userId: number, name: string) {
    onChange([...value, { userId, name }]);
    setQuery("");
  }

  function removePerson(userId: number) {
    onChange(value.filter((person) => person.userId !== userId));
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <span className="text8 text-ehs-gray block font-semibold">
        Authorized Personnel
      </span>
      <p className="text8 text-ehs-muted-text">
        Only these users can perform this LOTO procedure
      </p>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((person) => (
            <span
              key={person.userId}
              className="text8 bg-ehs-light-blue text-ehs-dark-blue inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-2.5 font-semibold"
            >
              {person.name}
              <button
                type="button"
                onClick={() => {
                  removePerson(person.userId);
                }}
                aria-label={`Remove ${person.name}`}
                className="hover:bg-ehs-surface-inverse/10 inline-flex size-3.5 cursor-pointer items-center justify-center rounded-full"
              >
                <Icon icon="mdi:close" className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative min-w-0">
        <input
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          value={query}
          placeholder="Search people at this site..."
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={[FIELD_INPUT_CLASS, "pr-9"].join(" ")}
        />

        <Icon
          icon={isSearching ? "mdi:loading" : "mdi:magnify"}
          className={[
            "text-ehs-muted-text pointer-events-none absolute top-1/2 right-2.5 size-3.75 -translate-y-1/2",
            isSearching ? "animate-spin motion-reduce:animate-none" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />

        {open ? (
          <div className="animate-popover-in rounded-2.5 bg-ehs-surface border-ehs-border-ink/10 absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden border shadow-(--ehs-shadow-popover)">
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Site personnel"
              className="max-h-56 overflow-y-auto p-1"
            >
              {siteId <= 0 ? (
                <li className="text-ehs-muted-text px-2.5 py-3 text-sm">
                  Your sign-in isn&apos;t linked to a site, so there&apos;s no
                  roster to search.
                </li>
              ) : usersQuery.isLoading ? (
                <li className="flex flex-col gap-1 p-1.5">
                  {[0, 1, 2].map((row) => (
                    <span
                      key={row}
                      className="bg-ehs-surface-inverse/6 h-8 animate-pulse rounded-lg"
                    />
                  ))}
                </li>
              ) : usersQuery.isError ? (
                <li className="text-ehs-muted-text px-2.5 py-3 text-sm">
                  Couldn&apos;t load people. Try again in a moment.
                </li>
              ) : users.length === 0 ? (
                <li className="text-ehs-muted-text px-2.5 py-3 text-sm">
                  {debouncedQuery.trim()
                    ? `No one matches "${debouncedQuery.trim()}".`
                    : "No one else is available to add."}
                </li>
              ) : (
                users.map((user) => (
                  <li key={user.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        addPerson(user.id, displayNameFor(user));
                        setOpen(false);
                      }}
                      className="rounded-2 hover:bg-ehs-surface-inverse/4 flex w-full cursor-pointer items-center justify-between gap-2.5 px-2.5 py-2 text-left transition-colors"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="text-ehs-dark-bg truncate text-base font-semibold">
                          {displayNameFor(user)}
                        </span>
                        {user.roleName ? (
                          <span className="text-ehs-muted-text truncate text-sm">
                            {user.roleName.replaceAll("_", " ")}
                          </span>
                        ) : null}
                      </span>
                      <Icon
                        icon="mdi:plus"
                        className="text-ehs-dark-blue size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? <p className="text8 text-ehs-red">{error}</p> : null}
    </div>
  );
}
