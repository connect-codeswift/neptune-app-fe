# CONTEXT.md — what I read and what I concluded

A working map of `neptune-app-fe`, written after reading the repo's infrastructure end to end.
It records **my understanding**, including where that understanding disagrees with `AGENTS.md`.
`AGENTS.md` remains the rules file; this is a navigation aid and a findings log.

Snapshot: branch `hamid`, HEAD `0be4455` ("awaiting effectiveness review"), 1,144 tracked-ish
files, ~11 MB under `src/`.

---

## 1. What this app is

The tenant-facing Neptune EHSS dashboard — one of **five** frontends served by a single
ASP.NET backend (`Neptune-Ehss-BE`). Modules: incidents, near-miss, hazard, LOTO, CAPA/RCA,
audits, inspections, BBS, walk & talk, HazCom, PPE, policy maker, regulatory compliance,
industrial hygiene, plus analytics/reports/emissions/fleet stubs and a Neptune AI assistant.

Next.js 16 App Router · React 19 (**React Compiler on** — no manual `useMemo`/`useCallback`/`memo`
for perf) · TypeScript · Tailwind v4 (no config file) · TanStack Query v5 · TanStack Table v8 ·
Redux Toolkit (wizards only) · axios · zod · recharts · sonner · @iconify/react.

No test suite. `npm run build` is the real typecheck; `npm run lint` + `npx tsc --noEmit` alongside.

---

## 2. Directory map (with weight)

```
src/app/          170 files  169 KB   routes only; pages stay thin
src/components/   663 files  3.2 MB   one folder per module + ui/ + inputs/ + providers/
src/services/      56 files  474 KB   28 *.service.ts + 29 mappers/
src/hooks/         51 files  181 KB   use-<domain>-queries.ts / -mutations.ts
src/lib/           49 files  194 KB   axios, auth, nav, mappers, theme, formatting
src/dtos/          74 files  131 KB   req/ (33) + res/ (41)
src/store/          5 files   10 KB   RTK — audit, audit-template, inspection-template only
documents/          6 files  433 KB   stale local copies incl. swagger.json — not the contract
```

Component-folder weight (largest first): `incidents` 152 files / 735 KB · `hazcom` 64 / 278 ·
`policy-maker` 51 / 190 · `capa` 41 / 236 · `audits` 32 / 178 · `ppe` 32 / 144 ·
`industrial-hygiene` 32 / 132 · `inspections` 31 / 175 · `loto` 31 / 141 · `ui` 22 / 82.
`compliance/` is an empty directory; the live module is `regulatory-compliance/`.

---

## 3. The data chain (read in full)

```
src/dtos/req|res/<domain>.dto.ts
   ↓
src/services/<domain>.service.ts     axios `http`; one exported fn per endpoint, JSDoc'd
                                     `METHOD /api/v1/path`. Only layer touching unknown shapes.
   ↓
src/services/mappers/<domain>.mapper.ts    DTO → UI domain type
   ↓
src/hooks/use-<domain>-queries|mutations.ts   "use client"; TanStack Query
   ↓
src/components/<module>/<Thing>Content.tsx    owns fetching for one route
   ↓
<Thing>View / Header / list / card             presentational, resolved props only
```

- Envelope: `ApiEnvelopeDto<T>` = `statusCode / success / message / isError / errorDetails / dataModel`.
  Lists nest `PagedDataDto<T>` = `data / pageNumber / pageSize / totalRecords` inside `dataModel`.
  Unwrap in the service; never read `.dataModel` from a component.
- Backend casing is inconsistent (camel **and** Pascal in one payload). Every service redeclares
  its own `isRecord` / `readProp` / `asNumber` / `asString` / `asBoolean` coercers. That duplication
  is deliberate — don't hoist it into a shared util unasked.
- Query keys are a `<domain>QueryKeys` factory with `all` + one entry per query. Queries apply the
  mapper in `select` and thread an explicit `enabled`; mutations invalidate `<domain>QueryKeys.all`.
- ~220 exported hooks across 51 files. UI domain types live at
  `src/components/<module>/<module>-types.ts`.

### The `*Content.tsx` boot gate (37 of them)

Client component, boot-gated on `isClientReady && hasToken`, fixed render order:
spinner → "sign in required" → query error (message + Try again) → not found → the real `*View`.
Copy the nearest existing one rather than inventing an arrangement.

---

## 4. API surface — the important correction

**Every route is now versioned kebab-case REST under `/api/v1/`.** `src/lib/axios.ts` derives the
`v1` segment itself (`withApiVersion`, idempotent) from `NEXT_PUBLIC_API_BASE_URL` /
`API_PROXY_TARGET`, so the ~190 path constants in `src/services/` carry no version.

That makes the PascalCase RPC-ish paths referenced in `AGENTS.md`/`HANDOFF.md`
(`PUT /api/Document/DocApproval`, `PUT /api/Hazard/CloseHazard/{id}`, `PATCH /CAPA/Drop/{id}`)
**historical**. The services document each rename inline. Current families:

| Domain | Base paths |
| --- | --- |
| auth | `/auth/{login,register,logout,refresh-token,forgot-password,verify-otp,verify-mfa,select-site}`, `/auth/mfa/{setup,enable,disable,dismiss}`, `/auth/me/change-password` |
| session/org | `/organizations/me`, `/users/{id}`, `/users/me`, `/users/me/avatar`, `/users/dropdown`, `/sites/{id}/users`, `/sites/work-hours` |
| incidents | `/incidents`, `/incidents/search`, `/incidents/{id}/closure`, `/incidents/{header,list,dashboard}-kpis`, `/kpi-targets` |
| capa | `/capas`, `/capa-tasks`, `/capas/{id}/{detail,tasks,comments,attachments,verification}`, `/capas/{dashboard-kpis,lifecycle,opened-vs-closed,workload-by-owner,awaiting-effectiveness-review}` |
| rca | `/rca-categories`, `/rcas/{id}/capas`, `/incidents/{id}/rca`, `/rca-{contributing-factors,whys,corrective-actions}` |
| near-miss / hazard | `/near-misses`, `/hazards` + `/search`, `/kpis`, `/recognitions`, `/heatmap`, `/{id}/close` |
| loto | `/loto/{equipment,lockouts,personnel,dashboard-kpis}` + `/search`, `/locations` |
| hazcom | `/hazcom/{chemicals,sds,hazard-codes,precautionary-codes,trainings,risk-assessments}`, `/hazcom/dashboard/*` |
| policy maker | `/documents`, `/documents/search`, `/document-versions/{id}/{approval,acknowledge,acknowledgements}`, `/document-categories` |
| compliance | `/compliance-records` + `/search`, `/dashboard-kpis`, `/category-stats`, `/upcoming-filings`, `/calendar` |
| ppe | `/ppe/{items,issues,kpis,replace-requests}`, `/ppe/issues/assigned-to-me` |
| bbs / walk&talk | `/bbs/{observations,behavior-categories,dashboard-kpis,at-risk-categories,graph}`, `/walk-and-talk/{sessions,dashboard-kpis,top-findings,graph}` |
| audits / inspections | `/audits`, `/audit-templates`, `/inspections`, `/inspection-templates` |
| misc | `/command-center/{dashboard-kpis,incident-trends,my-actions}`, `/departments`, `/files/upload-intent`, `/assistant/conversations` |

The contract of record is still `neptune-be/FEGuides/<Module>.md`. `documents/swagger.json` and
`sw.json` are stale dumps.

**Two upload paths coexist:** Cloudinary client-side (`src/lib/upload-to-cloudinary.ts`, URL goes in
`pdfPath`/`filePath`) and a newer signed-URL flow (`files.service.ts`: `POST /files/upload-intent` →
`PUT` to the bucket **without** a bearer token → `POST /files/{id}/commit`; `GET /files/{id}`
download URLs expire in 15 min and must not be persisted).

---

## 5. Auth, session, permissions

- `src/lib/axios.ts` owns `neptune-access-token` / `neptune-refresh-token` (localStorage + in-memory
  mirror), the request interceptor, and `HttpError`. A 401 triggers a **coalesced** refresh
  (`refreshAccessToken()` shares one in-flight promise); a request is retried at most once
  (`retriedAfterRefresh`); the refresh call is a bare `axios.post` so it cannot re-enter the
  interceptor. Failure clears tokens and redirects to `/login`.
- Org access window: `src/lib/access-window.ts` caches `{accessExpiresAt, daysRemaining}` in
  sessionStorage and turns an expired-tenant 401 into a login redirect carrying a message.
- `AppShell.tsx` is the auth gate (no token → replace to `/login`) and owns the rail + limits banner.
- **Two identity helpers, both decoding the same JWT with different claim fallbacks:**
  `getAuthContext()` (`@/lib/auth-context`) → `{userId, siteId, subCompanyId, siteName,
  organizationId, organizationName, email, fullName}` for identity questions;
  `getCurrentUser()` (`@/lib/current-user`) → `{userId, siteId, subCompanyId, organizationName, role}`
  plus the elevated-role gates. The duplication is existing — don't unify unasked.
- Elevated roles (`current-user.ts`): `ehs manager | ehs director | lead` gate
  `canEditHazard / canCloseHazard / canEditNearMiss / canCloseNearMiss /
  canConvertNearMissToIncident / canViewNearMissInsights / canViewHazardInsights /
  canManagePpeInventory`. CAPA verification has its own list (`ehs director | ehs lead |
  ehs manager | lead`) plus "verifier ≠ action owner" (`isCapaOwnedByCurrentUser`).
- `isAdminRole()` now matches **only** `Ehs_Director` — the old Admin/System Admin/Primary_Admin
  names were removed when seven roles became five, so it had been returning false for everyone.
- Sidebar visibility (`src/lib/app-nav.ts`) resolves in this order, and the order is load-bearing:
  1. module licence gate (`moduleCode` ∈ `activatedModules`, or `alwaysVisible`)
  2. `allowedRoles` — a restriction nothing below may widen
  3. `isAdminRole` bypass
  4. `page:<slug>` **prefix** permission match, but only if the token carries any `page:` claim
  5. else `moduleOnlyGating`, else `requiredPermissions.some(...)`
  Adding a dashboard route means registering it in `APP_NAV_GROUPS` **and** `ehs-modules.ts`,
  not just creating the folder. Hiding a nav item is not access control.
- Mutation errors: `getMutationErrorMessage(error, fallback)` from `@/hooks/use-auth-mutations`.

---

## 6. Styling

Tailwind v4, tokens in `@theme inline` in `src/app/globals.css` (1,033 lines). Beyond the
`ehs-*` hues there is a full **role/surface layer** added for dark mode — this is the part most
easily missed:

- surfaces: `ehs-surface`, `-raised`, `-inverse(-text)`; `ehs-canvas-dark(-text)` (dark in *both*
  themes: sign-in panel, media/PDF viewers); `ehs-paper*` (light in *both* themes: the GHS label
  preview, which must print and scan)
- ink: `ehs-on-accent` (on filled accents — distinct from `ehs-light-text`), `ehs-red-ink(-soft)`,
  `ehs-yellow-ink(-soft)`, `ehs-placeholder`, `ehs-border-ink` (opaque, so `/8` restates the alpha)
- state: `ehs-skeleton(-strong)`, `ehs-warning-{surface,border,ink}`, `ehs-hairline`,
  `ehs-border-strong`, `ehs-overlay(-media)`, `ehs-progress-done`
- shadows as CSS vars: `--ehs-shadow-{card,card-flat,popover,modal,dialog,tooltip,button-primary-flat}`
- radius `rounded-2 / -2.5 / -3 / -4 / -5` (Tailwind's named scale stops short)
- theme = `data-theme` on `<html>` + `color-scheme`, set pre-paint by the inlined
  `THEME_INIT_SCRIPT`; `ThemeProvider` adopts rather than recomputes. Preference is read via
  `useSyncExternalStore`, never copied into state by an effect.

Some newer Figma-matched components hardcode hex (`text-[#0b1320]`). Both styles coexist — match
the file you're editing. Never paste fractional Figma px; round to integer then the 4px scale.
Gradients are `bg-linear-to-*`.

---

## 7. Conventions I will follow

- Components under `src/components/` take one `props` param typed `Readonly<XProps>`, with the
  props type itself `Readonly<…>` (Sonar S6759).
- No ternary nested in a ternary (Sonar S3358) — lookup `Record`, named const, or `resolveX()`
  with early returns. ESLint does not catch this; SonarLint does.
- `Text.tsx` with an explicit `as=` inside modules that already use it; `ui/Button` variants
  `primary | secondary | tertiary | danger` (+ `isLoading` implying `disabled`); `ui/Table` wraps
  TanStack Table — never hand-roll `<table>`; toasts via `src/lib/toast.ts`, not `sonner` directly;
  icons via `@iconify/react`. Check `ui/` before building a control.
- `"use client"` only where actually needed.
- Redux only for the three builder wizards. Server state is TanStack Query; local state is `useState`.
- Verification: three concurrent agents running typecheck / lint / build, looping until clear.
  `npm run lint` is judged as a delta against the accepted baseline, not on exiting 0.

---

## 8. Where my reading disagreed with the docs

1. **API version + casing.** `AGENTS.md` and `HANDOFF.md` describe pre-`v1`, PascalCase RPC paths.
   The code is entirely `/api/v1/` kebab-case REST, with the version derived in `axios.ts`. (§4)
2. **`SubCompanyId` → `SiteId` rename is mid-rollout.** `subCompanyId` survives as a documented
   `@deprecated` alias of `siteId` in both `AuthContext` and `CurrentUser`, and both read legacy
   claim keys. New code should say `siteId`.
3. **Lint is not fully clean of `react-hooks/set-state-in-effect`.** `AGENTS.md` states 0 errors /
   0 warnings and that any such report is a real finding. `hazard/detail/HazardDetailContent.tsx:53`
   still carries an inline `eslint-disable-next-line` for a one-time role read. Either the baseline
   or the doc is out of date — worth resolving before that rule is used as a review gate.
4. **`GET api/Auth/Org/me`** in the doc is `GET /api/v1/organizations/me` in `org.service.ts`;
   it is org-scoped, so `normalize-session.ts` merges user identity back in from the JWT
   (`mergeJwtUserIntoSession`) and returns **no** permissions from that payload.
5. `documents/` at the repo root holds stale local copies (`swagger.json`,
   `RBAC-Frontend-Guide-Updated.md`). `neptune-be/FEGuides/` wins.

---

## 9. What I have NOT read

`src/components/**` bodies, other than `AppShell.tsx`, `Text.tsx`, `ui/Button.tsx` and
`hazard/detail/HazardDetailContent.tsx` as the representative route shape. That tree is 3.2 MB
across 663 files; loading it wholesale would exceed the context window and be compacted away
before it could be used. I hold the complete file map, so any module can be read in depth on demand
— `incidents` (152 files) and `hazcom` (64) are the two that will need a deliberate pass.

Also unread: the 29 mapper bodies (I have their names and domains), the `form-builder/` shared
wizard internals, and `public/`.
