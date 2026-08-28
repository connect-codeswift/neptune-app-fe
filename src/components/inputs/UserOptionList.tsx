"use client";

import { Icon } from "@iconify/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  secondaryLineFor,
  type UserOption,
} from "@/components/inputs/user-option";

export type UserOptionListProps = Readonly<{
  listboxId: string;
  /** Announced name for the listbox, e.g. "People at Bayside Plant". */
  label: string;
  /** Sticky heading above the rows. Omitted when there is nothing useful to say. */
  heading?: string | null;
  users: readonly UserOption[];
  /** Ids already chosen — shown with a check rather than hidden. */
  selectedIds?: readonly string[];
  /** Index of the keyboard-highlighted row, or `-1`. */
  activeIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (user: UserOption) => void;
  isLoading: boolean;
  isError: boolean;
  /** `source: "site"` with no site claim — a different problem from "nobody matched". */
  hasNoSite: boolean;
  /** The term the list answers, for the "no one matches X" copy. */
  query: string;
  /** Per-picker copy for the states that need to tell the user what to do next. */
  messages: Readonly<{
    noSite: string;
    loadError: string;
    emptyNoQuery: string;
    emptyWithQuery: (query: string) => string;
  }>;
}>;

/**
 * The options half of a user picker: rows, keyboard highlight wiring, and the
 * four states a roster can be in.
 *
 * Presentational on purpose — it fetches nothing and handles no key events. The
 * input owns focus, so the input owns the keyboard; this component only reports
 * which row the pointer is over and which row was chosen.
 */
export function UserOptionList(props: Readonly<UserOptionListProps>) {
  const {
    listboxId,
    label,
    heading,
    users,
    selectedIds = [],
    activeIndex,
    onHighlight,
    onSelect,
    isLoading,
    isError,
    hasNoSite,
    query,
    messages,
  } = props;

  return (
    <>
      {heading ? (
        <p className="text-ehs-muted-text border-ehs-border truncate border-b px-3 pt-2 pb-1.5 text-sm font-semibold tracking-wider uppercase">
          {heading}
        </p>
      ) : null}

      <ul
        id={listboxId}
        role="listbox"
        aria-label={label}
        className="max-h-56 overflow-y-auto p-1"
      >
        <UserOptionListBody
          listboxId={listboxId}
          users={users}
          selectedIds={selectedIds}
          activeIndex={activeIndex}
          onHighlight={onHighlight}
          onSelect={onSelect}
          isLoading={isLoading}
          isError={isError}
          hasNoSite={hasNoSite}
          query={query}
          messages={messages}
        />
      </ul>
    </>
  );
}

/**
 * Split out so the states can be early returns.
 *
 * Inline, they were a five-deep ternary chain — the exact shape Sonar S3358
 * rejects, and unreadable besides.
 */
function UserOptionListBody(
  props: Readonly<Omit<UserOptionListProps, "label" | "heading">>,
) {
  const {
    listboxId,
    users,
    selectedIds = [],
    activeIndex,
    onHighlight,
    onSelect,
    isLoading,
    isError,
    hasNoSite,
    query,
    messages,
  } = props;

  if (hasNoSite) {
    return (
      <li className="text-ehs-muted-text px-2.5 py-3 text-base">
        {messages.noSite}
      </li>
    );
  }

  if (isLoading) {
    return (
      <li className="flex flex-col gap-1 p-1.5">
        {[0, 1, 2].map((row) => (
          <span
            key={row}
            className="bg-ehs-surface-inverse/6 h-10 animate-pulse rounded-lg"
          />
        ))}
      </li>
    );
  }

  if (isError) {
    return (
      <li className="text-ehs-muted-text px-2.5 py-3 text-base">
        {messages.loadError}
      </li>
    );
  }

  const trimmedQuery = query.trim();

  if (users.length === 0) {
    return (
      <li className="p-1.5">
        <EmptyState
          variant="inline"
          icon="mdi:account-off-outline"
          title={
            trimmedQuery
              ? messages.emptyWithQuery(trimmedQuery)
              : messages.emptyNoQuery
          }
        />
      </li>
    );
  }

  return users.map((user, index) => (
    <UserOptionRow
      key={user.id}
      id={`${listboxId}-option-${String(index)}`}
      user={user}
      isSelected={selectedIds.includes(user.id)}
      isActive={index === activeIndex}
      onHighlight={() => onHighlight(index)}
      onSelect={() => onSelect(user)}
    />
  ));
}

type UserOptionRowProps = Readonly<{
  id: string;
  user: UserOption;
  isSelected: boolean;
  isActive: boolean;
  onHighlight: () => void;
  onSelect: () => void;
}>;

function UserOptionRow(props: Readonly<UserOptionRowProps>) {
  const { id, user, isSelected, isActive, onHighlight, onSelect } = props;
  const secondary = secondaryLineFor(user);

  return (
    <li id={id} role="option" aria-selected={isSelected}>
      <button
        type="button"
        // Pointer-down, not click: the input's blur would otherwise close the
        // menu before the click lands.
        onMouseDown={(event) => {
          event.preventDefault();
          onSelect();
        }}
        onMouseEnter={onHighlight}
        className={[
          "rounded-2 flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-left transition-colors",
          isActive ? "bg-ehs-normal-blue/10" : "hover:bg-ehs-surface-inverse/4",
        ].join(" ")}
      >
        <UserAvatar name={user.name} profileUrl={user.profileUrl} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-ehs-dark-bg truncate text-base font-semibold">
            {user.name}
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
}
