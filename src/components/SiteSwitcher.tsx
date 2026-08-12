"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { SessionSiteDto } from "@/dtos/res/session-response.dto";

/**
 * Company / site scope picker in the dashboard header.
 *
 * The trigger shows the company; the menu lists that company's sites so the
 * user can narrow the dashboard to one of them (or back to "All sites").
 */
const ALL_SITES = "All sites";

export type SiteSwitcherSite = Pick<SessionSiteDto, "id" | "siteName">;

export type SiteSwitcherProps = Readonly<{
  company: string;
  sites?: readonly SiteSwitcherSite[];
  /** Selected site id, or `null` for all sites. Omit to let the component own it. */
  selectedSiteId?: number | null;
  onChange?: (siteId: number | null) => void;
  /** Set false where a session must always be scoped to exactly one site. */
  allowAllSites?: boolean;
  disabled?: boolean;
  className?: string;
}>;

export function SiteSwitcher(props: Readonly<SiteSwitcherProps>) {
  const {
    company,
    sites = [],
    selectedSiteId,
    onChange,
    allowAllSites = true,
    disabled = false,
    className = "",
  } = props;

  const [open, setOpen] = useState(false);
  const [internalSiteId, setInternalSiteId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Drop a stale uncontrolled selection when the site list no longer contains it
  // (derived — avoid syncing via an effect).
  const resolvedInternalSiteId =
    internalSiteId != null && sites.some((site) => site.id === internalSiteId)
      ? internalSiteId
      : null;

  const activeSiteId =
    selectedSiteId === undefined ? resolvedInternalSiteId : selectedSiteId;
  const selectedSiteName =
    activeSiteId == null
      ? ALL_SITES
      : (sites.find((site) => site.id === activeSiteId)?.siteName ?? ALL_SITES);

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

  function selectSite(siteId: number | null) {
    if (selectedSiteId === undefined) {
      setInternalSiteId(siteId);
    }
    onChange?.(siteId);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className={["relative shrink-0", className].join(" ")}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="border-ehs-border text-ehs-darker hover:bg-ehs-light-bg inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-colors disabled:cursor-wait disabled:opacity-60"
      >
        <Icon
          icon="mdi:office-building-outline"
          className="text-ehs-gray size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="max-w-[12rem] truncate whitespace-nowrap">
          {company}
        </span>
        {selectedSiteName === ALL_SITES ? null : (
          <span className="bg-ehs-light-blue text-ehs-dark-blue max-w-[8rem] truncate rounded-full px-2 py-px text-[10px] font-semibold">
            {selectedSiteName}
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

          {allowAllSites ? (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={activeSiteId == null}
              onClick={() => selectSite(null)}
              className={[
                "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                activeSiteId == null
                  ? "text-ehs-dark-blue font-semibold"
                  : "text-ehs-darker hover:bg-ehs-light-bg",
              ].join(" ")}
            >
              <span className="truncate">{ALL_SITES}</span>
              {activeSiteId == null ? (
                <Icon
                  icon="mdi:check"
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          ) : null}

          {sites.map((site) => {
            const isSelected = site.id === activeSiteId;

            return (
              <button
                key={site.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => selectSite(site.id)}
                className={[
                  "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "text-ehs-dark-blue font-semibold"
                    : "text-ehs-darker hover:bg-ehs-light-bg",
                ].join(" ")}
              >
                <span className="truncate">{site.siteName}</span>
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
