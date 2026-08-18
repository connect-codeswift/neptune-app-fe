"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { LotoLocationSelection } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoLocationsQuery } from "@/hooks/use-loto-queries";

const SEARCH_DEBOUNCE_MS = 300;

export type LotoLocationSearchFieldProps = Readonly<{
  value: LotoLocationSelection | null;
  onChange: (next: LotoLocationSelection | null) => void;
  error?: string | null;
}>;

/**
 * Location picker for the create/edit procedure form — a combobox over
 * GET /api/v1/locations?search=. The backend requires a `locationId` from
 * this register; free text is gone.
 */
export function LotoLocationSearchField(
  props: Readonly<LotoLocationSearchFieldProps>,
) {
  const { value, onChange, error = null } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const hasToken = useHasAccessToken();
  const listboxId = useId();

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  // Fetch only once the menu has been opened — no reason to spend a request
  // on a list nobody has asked to see yet.
  const locationsQuery = useLotoLocationsQuery(
    debouncedQuery.trim(),
    open && hasToken === true,
  );
  const locations = locationsQuery.data ?? [];

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const isSearching =
    open && (locationsQuery.isFetching || debouncedQuery !== query);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <Text as="span" className="text8 text-ehs-gray font-semibold">
          Location
        </Text>
        <Text as="span" className="text8 text-ehs-red">
          *
        </Text>
      </div>

      <div className="relative min-w-0">
        <input
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          value={open ? query : (value?.name ?? "")}
          placeholder="Search locations..."
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            // Typing over a picked location breaks the link to its id.
            if (value) {
              onChange(null);
            }
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          className={[FIELD_INPUT_CLASS, "pr-9"].join(" ")}
        />

        <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
          {value && !open ? (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setQuery("");
              }}
              aria-label="Clear location"
              className="text-ehs-muted-text hover:text-ehs-darker inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
            >
              <Icon icon="mdi:close" className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <Icon
              icon={isSearching ? "mdi:loading" : "mdi:magnify"}
              className={[
                "text-ehs-muted-text pointer-events-none size-3.75",
                isSearching ? "animate-spin motion-reduce:animate-none" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {open ? (
        <div className="animate-popover-in rounded-2.5 absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]">
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Locations"
            className="max-h-56 overflow-y-auto p-1"
          >
            {locationsQuery.isLoading ? (
              <li className="flex flex-col gap-1 p-1.5">
                {[0, 1, 2].map((row) => (
                  <span
                    key={row}
                    className="h-8 animate-pulse rounded-lg bg-[rgba(15,23,42,0.06)]"
                  />
                ))}
              </li>
            ) : locationsQuery.isError ? (
              <li className="px-2.5 py-3">
                <Text as="p" className="text8 text-ehs-muted-text">
                  Couldn&apos;t load locations. Try again in a moment.
                </Text>
              </li>
            ) : locations.length === 0 ? (
              <li className="px-2.5 py-3">
                <Text as="p" className="text8 text-ehs-muted-text">
                  {debouncedQuery.trim()
                    ? `No location matches “${debouncedQuery.trim()}”.`
                    : "No locations are registered for this site yet."}
                </Text>
              </li>
            ) : (
              locations.map((location) => (
                <li
                  key={location.id}
                  role="option"
                  aria-selected={value?.id === location.id}
                >
                  <button
                    type="button"
                    // Pointer-down, not click: the input's blur would otherwise
                    // close the menu before the click lands.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange({ id: location.id, name: location.name });
                      setQuery("");
                      setOpen(false);
                    }}
                    className="rounded-2 flex w-full cursor-pointer items-center justify-between gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[rgba(15,23,42,0.04)]"
                  >
                    <Text
                      as="span"
                      className="text4 text-ehs-darker truncate font-semibold"
                    >
                      {location.name}
                    </Text>
                    {value?.id === location.id ? (
                      <Icon
                        icon="mdi:check"
                        className="text-ehs-dark-blue size-4 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {error ? (
        <Text as="p" className="text8 text-ehs-red">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
