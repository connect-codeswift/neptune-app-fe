"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ReportFieldLabel } from "@/components/incidents/report/shared/ReportFormField";
import { normalizeGender } from "@/components/incidents/report/shared/report-injury-level";
import {
  FIELD_INPUT_CLASS,
  FIELD_INPUT_LG_CLASS,
} from "@/components/ui/field-styles";
import { readUserGender, type SiteUserDto } from "@/dtos/res/user-response.dto";
import { useDismissOnOutsideClick } from "@/hooks/use-dismiss-on-outside-click";
import { useSiteUsersQuery } from "@/hooks/use-user-queries";

/** Long enough that a name typed at speed is one request, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 300;

const EMBEDDED_INPUT_CLASS = `h-10 ${FIELD_INPUT_LG_CLASS}`;

type MenuPosition = Readonly<{
  top: number;
  left: number;
  width: number;
}>;

export type ReportPersonSelection = Readonly<{
  /** Display name — what the field shows and what the report is filed under. */
  name: string;
  /** Backend user id, or `""` when the name was typed rather than picked. */
  userId: string;
  /**
   * The person's gender from their own record, mapped onto `GENDER_OPTIONS`.
   * `""` when they were typed rather than picked, or when their record doesn't
   * carry one — which is every record until the backend adds the field.
   */
  gender: string;
}>;

export type ReportPersonSearchFieldProps = Readonly<{
  label: string;
  required?: boolean;
  trailingHint?: string;
  placeholder?: string;
  value: string;
  /** `""` when the current text is free-typed rather than a picked person. */
  selectedUserId: string;
  onChange: (next: ReportPersonSelection) => void;
  /** Site whose roster is offered. `0` means the token carries no site claim. */
  siteId: number;
  siteName?: string | null;
  className?: string;
  /** Report forms use the default styling; modals use `embedded` with a portaled menu. */
  variant?: "report" | "embedded";
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

/**
 * Affected-person picker: a combobox over the people who belong to the current
 * site.
 *
 * Search runs on the backend (`GET /Auth/GetUsersBySiteId/{siteId}?search=`),
 * so the field works the same on a site with eight people and one with eight
 * hundred — the roster is never held client-side in full.
 *
 * Free text is still accepted. The affected person is often a contractor,
 * agency worker or visitor with no account, and an incident involving one of
 * them is exactly the incident you most need recorded — so failing to find a
 * match leaves the typed name in place rather than blocking the report. Picking
 * from the list is what upgrades the entry from a name to a real user id, which
 * is what the report is then filed against.
 */
export function ReportPersonSearchField(
  props: Readonly<ReportPersonSearchFieldProps>,
) {
  const {
    label,
    required = false,
    trailingHint,
    placeholder,
    value,
    selectedUserId,
    onChange,
    siteId,
    siteName,
    className = "",
    variant = "report",
  } = props;

  const isEmbedded = variant === "embedded";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlight, setHighlight] = useState<Readonly<{
    resultsKey: string;
    index: number;
  }> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const listboxId = `${fieldId}-listbox`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  // Only fetch once the menu has been opened. Step 1 is the first screen of the
  // form and most of its fields are never touched — no reason to spend a
  // request on a roster nobody has asked to see yet.
  const usersQuery = useSiteUsersQuery(
    siteId,
    { search: debouncedQuery },
    open,
  );
  const users = usersQuery.data ?? [];

  // The debounce means results lag the box by up to 300ms; say so rather than
  // letting a stale list look like the answer.
  const isSearching =
    open && (usersQuery.isFetching || debouncedQuery !== query);

  useDismissOnOutsideClick(rootRef, open && !isEmbedded, () => setOpen(false));

  useLayoutEffect(() => {
    if (!isEmbedded || !open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const menuHeight = menuRef.current?.offsetHeight ?? 240;
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
      const top = openUpward
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;

      setMenuPosition({
        top,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [
    isEmbedded,
    open,
    debouncedQuery,
    users.length,
    usersQuery.isLoading,
    usersQuery.isError,
  ]);

  useEffect(() => {
    if (!isEmbedded || !open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isEmbedded, open]);

  // A stale highlight is worse than none: the list changes under it as results
  // arrive, so Enter would commit whoever happens to have landed on that row.
  // Tagging the highlight with the result set it was made against expires it
  // on its own, rather than needing an effect to chase every list change.
  const resultsKey = `${debouncedQuery}:${String(usersQuery.dataUpdatedAt)}`;
  const activeIndex =
    highlight?.resultsKey === resultsKey ? highlight.index : -1;

  function moveHighlight(index: number) {
    setHighlight({ resultsKey, index });
  }

  function select(user: SiteUserDto) {
    onChange({
      name: displayNameFor(user),
      userId: String(user.id),
      gender: normalizeGender(readUserGender(user)),
    });
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function clear() {
    onChange({ name: "", userId: "", gender: "" });
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
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
        // Only swallow the key when it actually picks someone — otherwise the
        // form's own Enter handling should still see it.
        event.preventDefault();
        select(user);
      }
    }
  }

  const hasSelection = selectedUserId !== "";
  const inputClass = isEmbedded ? EMBEDDED_INPUT_CLASS : FIELD_INPUT_CLASS;

  const listbox = (
    <>
      {siteName ? (
        <p className="text-ehs-muted-text border-ehs-border truncate border-b px-3 pt-2 pb-1.5 text-sm font-semibold tracking-wider uppercase">
          People at {siteName}
        </p>
      ) : null}

      <ul
        id={listboxId}
        role="listbox"
        aria-label={`People at ${siteName ?? "this site"}`}
        className="max-h-56 overflow-y-auto p-1"
      >
        {siteId <= 0 ? (
          <li className="text-ehs-muted-text px-2.5 py-3 text-base">
            Your sign-in isn&apos;t linked to a site, so there&apos;s no roster
            to search. Type the person&apos;s name instead.
          </li>
        ) : usersQuery.isLoading ? (
          <li className="flex flex-col gap-1 p-1.5">
            {[0, 1, 2].map((row) => (
              <span
                key={row}
                className="h-10 animate-pulse rounded-lg bg-[rgba(15,23,42,0.06)]"
              />
            ))}
          </li>
        ) : usersQuery.isError ? (
          <li className="text-ehs-muted-text px-2.5 py-3 text-base">
            Couldn&apos;t load people for this site. Type the name instead, or
            try again in a moment.
          </li>
        ) : users.length === 0 ? (
          <li className="text-ehs-muted-text px-2.5 py-3 text-[13px]">
            {debouncedQuery.trim()
              ? `No one at ${siteName ?? "this site"} matches “${debouncedQuery.trim()}”. Your typed name is kept as-is.`
              : `No people are listed for ${siteName ?? "this site"} yet.`}
          </li>
        ) : (
          users.map((user, index) => {
            const name = displayNameFor(user);
            const secondary = secondaryLineFor(user);
            const isSelected = String(user.id) === selectedUserId;
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
                  // Pointer-down, not click: the input's blur would otherwise
                  // close the menu before the click lands.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(user);
                  }}
                  onMouseEnter={() => moveHighlight(index)}
                  className={[
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "bg-[rgba(8,145,166,0.1)]"
                      : "hover:bg-[rgba(15,23,42,0.04)]",
                  ].join(" ")}
                >
                  <span className="bg-ehs-light-blue text-ehs-dark-blue inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                    {initialsFor(name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-ehs-dark-bg truncate text-base font-semibold">
                      {name}
                    </span>
                    {secondary ? (
                      <span className="text-ehs-muted-text truncate text-sm">
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
    </>
  );

  const inlineMenu =
    open && !isEmbedded ? (
      <div className="animate-popover-in absolute top-full right-0 left-0 z-30 mt-1.5 overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]">
        {listbox}
      </div>
    ) : null;

  const portaledMenu =
    isEmbedded && mounted && open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className="animate-popover-in fixed z-[120] overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.1)] bg-white shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
          >
            {listbox}
          </div>,
          document.body,
        )
      : null;

  const inputControl = (
    <div ref={triggerRef} className="relative min-w-0">
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
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const text = event.target.value;
          setQuery(text);
          setOpen(true);
          // Typing over a picked name breaks the link to that account — the id
          // must not survive the text it stood for, and neither may a gender
          // that was read off it.
          onChange({ name: text, userId: "", gender: "" });
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={[
          inputClass,
          "border border-slate-900/10 py-3.5",
          hasSelection ? "pr-16" : "pr-9",
        ].join(" ")}
      />

      <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
        {hasSelection ? (
          <>
            <span
              title="Matched to a user account at this site"
              className="bg-ehs-light-blue text-ehs-dark-blue inline-flex size-[18px] items-center justify-center rounded-full"
            >
              <Icon
                icon="mdi:account-check"
                className="size-3"
                aria-hidden="true"
              />
            </span>
            <button
              type="button"
              onClick={clear}
              aria-label={`Clear ${label.toLowerCase()}`}
              className="text-ehs-muted-text hover:text-ehs-darker inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors"
            >
              <Icon icon="mdi:close" className="size-3.5" aria-hidden="true" />
            </button>
          </>
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

      {inlineMenu}
    </div>
  );

  if (isEmbedded) {
    return (
      <div
        className={["flex min-w-0 flex-col gap-1.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        <label
          htmlFor={fieldId}
          className="text-ehs-gray block text-base leading-[19.5px]"
        >
          {label}
          {required ? <span className="text-ehs-red"> *</span> : null}
        </label>

        <div ref={rootRef} className="relative min-w-0">
          {inputControl}
        </div>
        {portaledMenu}
      </div>
    );
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
        required={required}
        trailing={
          trailingHint ? (
            <Text as="span" className="text-ehs-muted-text text-base">
              {trailingHint}
            </Text>
          ) : undefined
        }
      />

      {inputControl}
    </div>
  );
}
