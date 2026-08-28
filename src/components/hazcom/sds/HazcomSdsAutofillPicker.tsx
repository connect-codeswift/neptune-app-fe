"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { FIELD_INPUT_CLASS } from "@/components/ui/field-styles";
import { HAZCOM_FIELD_LABEL_CLASS } from "@/components/hazcom/shared";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import { useSdsSearchQuery } from "@/hooks/use-hazcom-queries";
import type { HazcomSdsSearchResult } from "@/services/mappers/hazcom-sds.mapper";

/** Long enough that a query typed at speed is one request, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 300;

export type HazcomSdsAutofillPickerProps = Readonly<{
  /** Called when the user picks a result — the caller looks up the label. */
  onPick: (result: HazcomSdsSearchResult) => void;
  disabled?: boolean;
  className?: string;
}>;

/**
 * Typeahead over `GET /hazcom/sds/search` — picking a result is the trigger
 * for the chemical form's "autofill from SDS" flow (`GET /sds/{id}/label`,
 * fetched by the caller once a result is picked, not here).
 */
export function HazcomSdsAutofillPicker(
  props: Readonly<HazcomSdsAutofillPickerProps>,
) {
  const { onPick, disabled = false, className = "" } = props;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  const searchQuery = useSdsSearchQuery(debouncedQuery, open);
  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const trimmed = debouncedQuery.trim();
  const isSearching =
    open && (searchQuery.isFetching || query !== debouncedQuery);

  function pick(result: HazcomSdsSearchResult) {
    onPick(result);
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <div className="flex min-h-7 items-end justify-between gap-2">
        <Text as="span" className={HAZCOM_FIELD_LABEL_CLASS}>
          Autofill from SDS
        </Text>
        <Text as="span" className="text8 text-ehs-muted-text">
          Search by product name or CAS #
        </Text>
      </div>

      <div ref={rootRef} className="relative min-w-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            disabled={disabled}
            placeholder="e.g. Acetone or 67-64-1"
            aria-label="Search for an SDS to autofill from"
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={`${FIELD_INPUT_CLASS} pr-9`}
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
        </div>

        {open && trimmed !== "" ? (
          <div className="animate-popover-in rounded-2.5 border-ehs-border-ink/10 bg-ehs-surface absolute top-full right-0 left-0 z-30 mt-1.5 max-h-64 overflow-y-auto border shadow-(--ehs-shadow-popover)">
            {searchQuery.isLoading ? (
              <p className="text-ehs-muted-text px-3 py-3 text-sm">
                Searching…
              </p>
            ) : searchQuery.results.length === 0 ? (
              <p className="text-ehs-muted-text px-3 py-3 text-sm">
                No SDS matches “{trimmed}”.
              </p>
            ) : (
              <ul className="p-1">
                {searchQuery.results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      // Pointer-down, not click: the input's blur would
                      // otherwise close the menu before the click lands.
                      onMouseDown={(event) => {
                        event.preventDefault();
                        pick(result);
                      }}
                      className="rounded-2 hover:bg-ehs-surface-inverse/5 flex w-full flex-col items-start gap-0.5 px-2.5 py-2 text-left transition-colors"
                    >
                      <span className="text-ehs-dark-bg text-base font-semibold">
                        {result.productName}
                      </span>
                      <span className="text-ehs-muted-text text-sm">
                        {[result.manufacturer, result.casNumber]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
