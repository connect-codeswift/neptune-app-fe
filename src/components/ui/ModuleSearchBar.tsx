"use client";

import { Icon } from "@iconify/react";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

export type ModuleSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  /** Optional count shown opposite the field, e.g. "6 sessions". */
  resultLabel?: string;
  className?: string;
}>;

/**
 * Shared `max-w-md` search field used under module filter bars.
 */
export function ModuleSearchBar(props: ModuleSearchBarProps) {
  const {
    value,
    onChange,
    placeholder,
    "aria-label": ariaLabel,
    resultLabel,
    className = "",
  } = props;

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full min-w-0 max-w-md">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-normal-blue pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={[
            FIELD_INPUT_LG_CLASS,
            "pl-9 [&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:appearance-none",
            "[&::-webkit-search-results-button]:appearance-none",
            "[&::-webkit-search-results-decoration]:appearance-none",
          ].join(" ")}
        />
      </div>

      {resultLabel ? (
        <span className="text-ehs-muted-text shrink-0 text-sm">{resultLabel}</span>
      ) : null}
    </div>
  );
}
