# Unified user picker — design

**Date:** 2026-08-28
**Repo:** `neptune-app-fe`
**Status:** approved design, pending implementation plan

## Problem

Picking a person is one of the most repeated interactions in this app, and it is
implemented four separate times, with the DTO-to-display-name normalization
copied a fifth and sixth time on top:

| Today | Lines | Shape | Source |
| --- | --- | --- | --- |
| `incidents/report/shared/ReportPersonSearchField.tsx` | 681 | single, free text, portaled menu | site roster **or** org dropdown |
| `incidents/report/shared/ReportWitnessesField.tsx` | ~400 | multi, chips, free text | site roster |
| `loto/procedure/LotoPersonnelSearchField.tsx` | 240 | multi, filters invited/dropped | site roster |
| `form-builder/FormBuilderFields.tsx` → `PersonMultiControl` | ~150 | multi, badges | none — caller passes `options` |

Each one re-implements the same debounce, outside-click dismissal, listbox
roles, keyboard highlight, loading/error/empty states and avatar rows.

Seven more screens never render a picker at all — they call
`useUserDropdownQuery`, map it through `toAssigneeOptions` into `SelectOption[]`,
and thread that array into a FormBuilder `select` / `person-multi` field:
audits (auditor), inspections (inspector), PPE replacement (employee),
walk & talk (follow-up assignee), regulatory compliance (owner), policy maker
(audience + approvers), HazCom training (attendees). Every one of those forms
knows about user fetching, loading flags and refetch buttons that have nothing
to do with the form it is rendering.

Consequences: a fix to keyboard navigation lands in one picker and not the other
three; the org-wide list is searchable in incidents and a plain select
everywhere else; and the exclusion rule just added to witnesses ("the affected
person cannot witness their own incident") has no home that other screens can
reuse.

## Goal

Two components, used everywhere a person is chosen:

- **`src/components/inputs/UserPickerInput.tsx`** — pick one person.
- **`src/components/inputs/MultipleUsersPickerInput.tsx`** — pick several
  (HazCom trainees, witnesses, LOTO authorized personnel, policy approvers).

They are separate components on purpose. A single-select field owns a text
value and a blur rule; a multi-select owns a chip list and a per-row toggle.
Folding both into one `mode` prop would mean every consumer reads props that do
not apply to it, and every branch inside the component would have to ask which
mode it is in. Two focused files, one shared engine.

## Architecture

```
src/components/inputs/user-option.ts          UserOption type + normalizers
src/hooks/use-user-options.ts                 source switch, debounce, filter,
                                              plus useResolvedUserValues
src/components/inputs/UserOptionList.tsx      the listbox (rows, states, a11y)
src/components/inputs/UserPickerMenu.tsx      inline vs portaled popover shell
src/components/inputs/use-option-highlight.ts keyboard highlight + combobox keys
src/components/inputs/UserPickerInput.tsx     single
src/components/inputs/MultipleUsersPickerInput.tsx   multi
```

**Status: implemented.** Typecheck, lint and build are clean.

### `user-option.ts` — one shape for a person

The backend hands us two different rows for the same human: `SiteUserDto` from
`GET /api/v1/sites/{siteId}/users` and `UserDropdownItemDto` from
`GET /api/v1/users/dropdown`, the latter with four possible spellings of the id
and five of the name. Normalizing that is currently done in
`ReportPersonSearchField.toSiteUserFromDropdown`, in `lib/map-user.toAssigneeOptions`,
and in three private `displayNameFor` helpers.

```ts
export type UserOption = Readonly<{
  /** Always a non-empty string. `""` is reserved for free-typed names. */
  id: string;
  name: string;
  email: string;
  roleName: string;
  profileUrl: string | null;
  /** From the person's own record; `""` when their record doesn't carry one. */
  gender: string;
  /** Roster-only flags, `false` for org-dropdown rows. */
  isInvited: boolean;
  isDrop: boolean;
}>;

export function toUserOption(row: SiteUserDto | UserDropdownItemDto): UserOption | null;
export function secondaryLineFor(user: UserOption): string;   // "email · Role Name"
export function matchesQuery(user: UserOption, query: string): boolean;
```

`toUserOption` returns `null` for a row with no usable id, which is what
`toAssigneeOptions` already does via `flatMap`.

### `use-user-options.ts` — where people come from

```ts
useUserOptions({
  source: "site" | "org",
  siteId?: number,
  query: string,          // raw; the hook debounces at 300ms
  enabled: boolean,       // callers pass `open`
  exclude?: readonly string[],
  filter?: (user: UserOption) => boolean,
})
  → { users, isLoading, isError, isSearching, refetch }
```

`site` searches on the backend (`?search=`), `org` loads once and filters
client-side — the split that exists today, kept. The hook applies `exclude` and
`filter` **before returning**, because the keyboard highlight indexes into the
returned array: a row removed downstream shifts Enter onto the wrong person.
This is the bug the current witnesses exclusion was carefully written to avoid,
and centralizing it means the next picker cannot reintroduce it.

`filter` covers LOTO's rule (`!isInvited && !isDrop`) without the component
knowing what a lockout is.

### `UserOptionList.tsx` — the listbox

One presentational component: `role="listbox"`, avatar + name + secondary line
rows, the active-descendant wiring, and the four states (skeleton, error, empty,
rows). Takes `users`, `activeIndex`, `selectedIds`, `onHighlight`, `onSelect`,
plus the copy for the empty and error cases. No fetching, no keyboard handling
of its own — the parent owns the input and therefore owns the key events.

### `UserPickerInput.tsx` — single select

```ts
export type UserPickerValue = Readonly<{
  /** `""` when the name was typed rather than picked. */
  userId: string;
  name: string;
}>;

export type UserPickerInputProps = Readonly<{
  label: string;
  value: UserPickerValue;
  onChange: (next: UserPickerValue, user: UserOption | null) => void;
  source?: "site" | "org";          // default "site"
  siteId?: number;
  siteName?: string | null;
  required?: boolean;
  placeholder?: string;
  trailingHint?: string;
  /** Keep a typed name that matches nobody. Default false. */
  allowFreeText?: boolean;
  excludeUserIds?: readonly string[];
  filter?: (user: UserOption) => boolean;
  disabled?: boolean;
  error?: string | null;
  /** Full-width form styling, or `embedded` with a portaled menu for modals. */
  variant?: "form" | "embedded";
  hideLabel?: boolean;
  className?: string;
  inputClassName?: string;
}>;
```

`onChange` passes the whole `UserOption` alongside the value so a caller that
needs more than a name and an id — the incident form reads `gender` off the
affected person to drive its injury-level questions — gets it without a second
lookup. `allowFreeText: false` is today's `selectionOnly`, inverted so that the
stricter behaviour is the default and the loose one is asked for; the incident
affected-person field and witnesses both ask for it, because a contractor or
visitor with no account is exactly the person you most need recorded.

Inverting the flag changes the default for the two `person` fields that never
set `selectionOnly` — CAPA create (owner) and PPE issue (employee). Both file a
`userId` the backend needs, so a free-typed name there produces `""` and a
payload that cannot be honoured; making them strict is the correction, not a
regression. HazCom's trainer field already sets `selectionOnly: true` and simply
stops passing it. If either of the two turns out to want free text after all,
the fix is one `allowFreeText` prop, not a default flip back.

This component is `ReportPersonSearchField` **moved and generalized**, not
rewritten. Its portal positioning, blur handling and keyboard navigation are the
parts that took real bugs to get right.

### `MultipleUsersPickerInput.tsx` — multi select

Same props minus `value`/`onChange`, which become:

```ts
value: readonly UserPickerValue[];
onChange: (next: readonly UserPickerValue[], users: readonly UserOption[]) => void;
maxSelected?: number;
```

Selected people render as removable chips inside the control; Backspace on an
empty query removes the last one; already-selected rows stay in the list marked
`aria-selected` with a check, rather than disappearing. (LOTO removes them from
the list instead — the chip row already shows them, so showing them twice is
noise; the check-mark behaviour is the one to keep, since it is what witnesses
and `person-multi` already do and it stops the list from jumping as you pick.)

## FormBuilder

`person` keeps its config and starts delegating to `UserPickerInput`.

`person-multi` **stops taking `options`** and gains the same source props as
`person`:

```diff
 export type PersonMultiFieldConfig = BaseField & Readonly<{
   type: "person-multi";
-  options: readonly SelectOption[];
+  usersSource?: "site" | "org";
+  siteId?: number;
+  siteName?: string | null;
+  excludeUserIds?: readonly string[];
+  allowFreeText?: boolean;
   placeholder?: string;
   disabled?: boolean;
   note?: string;
 }>;
```

Its stored value stays `string[]` of user ids, so no mapper or payload changes.
`PersonMultiControl` is deleted; the case renders `MultipleUsersPickerInput`.

The `default:` branch of `renderField` is an exhaustiveness guard
(`const _never: never = field`), so every field type that needs updating is a
compile error — the FormBuilder half of this migration is checked by `tsc`, not
by reading.

## Migration

| Call site | Today | After |
| --- | --- | --- |
| Incident step 1 — affected person | `ReportPersonSearchField` | `UserPickerInput`, `allowFreeText` |
| Incident step 2 — witnesses | `ReportWitnessesField` | `MultipleUsersPickerInput`, `allowFreeText`, `excludeUserIds` |
| LOTO — authorized personnel | `LotoPersonnelSearchField` | `MultipleUsersPickerInput`, `filter` |
| HazCom training — attendees | `person-multi` + `attendeeOptions` | `person-multi`, self-fetching |
| Policy maker — audience, approvers | `person-multi` + `userOptions` | `person-multi`, `source: "org"` |
| Audits — auditor | `select` + `auditorOptions` | `person`, `source: "org"` |
| Inspections — inspector | `select` + `inspectorOptions` | `person`, `source: "org"` |
| PPE replacement — employee | `select` + `employeeOptions` | `person`, `source: "org"` |
| Walk & talk — follow-up assignee | `select` + `assigneeOptions` | `person`, `source: "org"` |
| Regulatory compliance — owner | `GlassSelect` + `userOptions` | `UserPickerInput`, `source: "org"` |

Each migrated form drops its `useUserDropdownQuery` call, its `toAssigneeOptions`
memo, the options argument on its schema builder, and the user-loading branch of
its `isLoading` / error / refetch handling.

Deleted at the end: `ReportPersonSearchField.tsx`, `ReportWitnessesField.tsx`,
`LotoPersonnelSearchField.tsx`, `PersonMultiControl`, and
`toAssigneeOptions` from `lib/map-user.ts`. `toUserNameLookup` and `userNameFor`
stay — they resolve ids to names in list views, which is a different job.

### Value-shape adapters

Two call sites do not store `{ userId, name }`:

- **Witnesses** persist a comma-separated name string, which is what the report
  mapper sends. `parseWitnessNames` / `joinWitnessNames` move next to the step-2
  call site as the adapter; the picker itself never sees the comma format.
- **LOTO** stores `{ userId: number, name: string }[]`. It maps at the boundary.

Neither shape changes, so no mapper, DTO or payload is touched by this work.

## Behaviour that must survive

Called out because each one exists for a reported reason:

1. Free-typed names are kept for the affected person and witnesses — contractors
   and visitors have no account.
2. The affected person is excluded from witnesses, by id **and** by name, in the
   list and on the Enter-to-add path.
3. `siteId <= 0` (no site claim in the JWT) shows the "not linked to a site"
   message rather than an empty roster that looks real.
4. Site search is a backend request per debounced term; org dropdown loads once.
5. The embedded/portaled variant, for pickers inside modals that would otherwise
   clip the menu.
6. Exclusions and filters apply before the array the keyboard indexes into.

## Verification

No test suite in this repo. Per `AGENTS.md`: `npx tsc --noEmit`, `npm run lint`
(delta against the accepted baseline, not the total), and `npm run build` — the
real typecheck. Plus a manual pass over the ten screens in the migration table,
since roster loading, empty states and modal clipping are not things the
compiler can check.

## Out of scope

- The backend contract. No endpoint, DTO or payload changes.
- `getUserById` / profile / avatar hooks.
- The detail-view witness rows, which are free-text inputs on a saved incident,
  not a roster picker.
- Unifying `getAuthContext()` and `getCurrentUser()`, which `AGENTS.md` calls out
  as existing duplication not to fix unasked.
