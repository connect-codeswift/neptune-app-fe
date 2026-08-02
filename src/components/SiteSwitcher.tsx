"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";

/**
 * Company / site scope picker in the dashboard header.
 *
 * The trigger shows the company; the menu lists that company's sites so the
 * user can narrow the dashboard to one of them (or back to "All sites").
 *
 * NOTE: the backend has no company or site endpoint yet — the API surface
 * exposes no /Company, /Site or /SubCompany route, and the access-token JWT
 * carries only `subCompanyId` / `organizationId`, no names. So `company` and
 * `sites` are props with placeholder defaults: swap the defaults for a query
 * once that endpoint lands and nothing else here has to change.
 */
export const ALL_SITES = "All sites";

export type SiteSwitcherProps = Readonly<{
  company?: string;
  sites?: readonly string[];
  /** Selected site, or `ALL_SITES`. Omit to let the component own it. */
  value?: string;
  onChange?: (site: string) => void;
  className?: string;
}>;

const DEFAULT_COMPANY = "Neptune Industries";
const DEFAULT_SITES: readonly string[] = [
  "Rawalpindi",
  "Islamabad",
  "Lahore",
  "Karachi",
];

export function SiteSwitcher(props: Readonly<SiteSwitcherProps>) {
  const {
    company = DEFAULT_COMPANY,
    sites = DEFAULT_SITES,
    value,
    onChange,
    className = "",
  } = props;

  const [open, setOpen] = useState(false);
  const [internalSite, setInternalSite] = useState(ALL_SITES);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const selectedSite = value ?? internalSite;

  // Close the menu on outside click and on Escape while it's open.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectSite(site: string) {
    if (value === undefined) {
      setInternalSite(site);
    }
    onChange?.(site);
    setOpen(false);
  }

  const options = [ALL_SITES, ...sites];

  return (
    <div ref={menuRef} className={["relative shrink-0", className].join(" ")}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="border-ehs-border text-ehs-darker hover:bg-ehs-light-bg inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-colors"
      >
        <Icon
          icon="mdi:office-building-outline"
          className="text-ehs-gray size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="max-w-[12rem] truncate whitespace-nowrap">
          {company}
        </span>
        {selectedSite === ALL_SITES ? null : (
          <span className="bg-ehs-light-blue text-ehs-dark-blue max-w-[8rem] truncate rounded-full px-2 py-px text-[10px] font-semibold">
            {selectedSite}
          </span>
        )}
        <Icon
          icon="mdi:chevron-down"
          className={[
            "text-ehs-muted-text size-3 shrink-0 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Sites for ${company}`}
          className="animate-popover-in absolute right-0 z-30 mt-1.5 w-60 origin-top-right overflow-hidden rounded-xl border border-slate-900/10 bg-white py-1 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
        >
          <p className="text-ehs-muted-text border-ehs-border truncate border-b px-3 pt-1.5 pb-2 text-[10px] font-semibold tracking-wider uppercase">
            {company}
          </p>

          {options.map((site) => {
            const isSelected = site === selectedSite;

            return (
              <button
                key={site}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => selectSite(site)}
                className={[
                  "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "text-ehs-dark-blue font-semibold"
                    : "text-ehs-darker hover:bg-ehs-light-bg",
                ].join(" ")}
              >
                <span className="truncate">{site}</span>
                {isSelected ? (
                  <Icon
                    icon="mdi:check"
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
