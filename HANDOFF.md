# Handoff — Neptune EHSS Frontend

Context for picking up this work in a new session (human or AI). Read this
top-to-bottom before touching code — the "how we work" section applies
project-wide, not just to the policy-maker module the last session focused
on.

## What this project is

**Neptune EHS** — an Environment, Health & Safety System frontend. Next.js
App Router SPA-style dashboard covering: incidents, near-miss reports,
hazards, CAPA (Corrective/Preventive Actions), audits, policy-maker
(document control), regulatory compliance, inspections, lockout-tagout,
PPE management, fleet management, emissions, analytics/reports. A separate
backend (ASP.NET-style, given the PascalCase-vs-camelCase inconsistencies
handled throughout) serves all of it over `NEXT_PUBLIC_API_BASE_URL`.

## ⚠️ Read this before writing any code

`AGENTS.md` at repo root (auto-loaded into `CLAUDE.md`):

> This is NOT the Next.js you know. This version has breaking changes —
> APIs, conventions, and file structure may all differ from your training
> data. Read the relevant guide in `node_modules/next/dist/docs/` before
> writing any code. Heed deprecation notices.

Installed: `next@16.2.7`, `react@19.2.4`. Don't assume Next 13/14 patterns.

## Tech stack

- **Next.js 16** (App Router), **React 19**, TypeScript, strict-ish ESLint
  (`eslint-config-next`, plus custom rules — see gotchas below)
- **TanStack Query v5** for all server state (no Redux/Zustand — component
  state is `useState`/`useMemo` only)
- **TanStack Table v8** for data grids (`components/ui/Table.tsx`)
- **Tailwind CSS v4** (CSS-variable based theme, no `tailwind.config.js` —
  tokens defined in `src/app/globals.css` under `@theme`, see styling below)
- **axios** wrapped in `src/lib/axios.ts` (see API layer below)
- **zod** — available but not universally used; check the specific form
  before assuming validation goes through it
- **@iconify/react** for all icons (`<Icon icon="mdi:..." />`), **sonner**
  for toasts (wrapped by `src/lib/toast.ts`)
- **Cloudinary** for file uploads — files are uploaded client-side first
  (`src/lib/upload-to-cloudinary.ts`), then only the resulting URL is sent
  to the backend (see any `pdfPath`/`filePath` field in a DTO)

## Repo map

```
src/
  app/                     — Next.js routes (App Router). (auth) and
                             (legal) are route groups (no URL segment).
                             app/dashboard/<module>/... mirrors the sidebar.
  components/
    <module>/              — one folder per feature (policy-maker, hazard,
                             near-miss, incidents, audits, form-builder,
                             regulatory-compliance, onboarding, auth)
    ui/                     — shared primitives (Button, Table, ...)
    AppShell.tsx            — auth-gated layout (redirects to /login if no
                             token), owns the sidebar
    Text.tsx                — typography primitive, always `as="h1"|"p"|...`
  dtos/
    req/*.dto.ts            — request body shapes, one file per backend
                             controller-ish grouping
    res/*.dto.ts            — response shapes; api-envelope.dto.ts defines
                             the wrapper every endpoint uses
  services/
    *.service.ts            — one per backend area (document, incident,
                             hazard, near-miss, capa, rca, auth, user,
                             ehs-command-center); one exported async
                             function per endpoint
    mappers/                — DTO → UI-domain-type conversion
  hooks/
    use-*-queries.ts         — TanStack Query wrappers + query-key factories
    use-*-mutations.ts       — TanStack Mutation wrappers
  lib/                      — axios client, auth helpers, toast, Cloudinary
                             upload, query client, misc formatters
sw.json                    — Swagger/OpenAPI dump at repo root. STALE (see
                             gotchas) — treat as a rough reference only.
```

## API conventions (project-wide — this is "how we work")

Every backend response is wrapped:

```ts
{ isError: boolean, dataModel: T, errorDetails: unknown,
  message: string, statusCode: number, success: boolean }
```

(`ApiEnvelopeDto<T>` in `dtos/res/api-envelope.dto.ts`.) Field casing from
the backend is inconsistent (camelCase in some places, PascalCase in
others, even within one payload) — every service function tolerates both via
small coercion helpers (see `isRecord`/`readProp`/`asNumber`/`asString`/
`asBoolean` at the top of `document.service.ts`, duplicated per service file
rather than shared — that's the existing pattern, don't "fix" it into a
shared util without being asked).

**Layering, strict one-way dependency:**

1. **`dtos/req|res/*.dto.ts`** — plain TS types. Comment each exported type
   with the HTTP verb + path it belongs to, e.g.
   `/** PUT /api/Document/DocApproval (JSON body). */`.
2. **`services/*.service.ts`** — one `async function` per endpoint, calling
   the shared `http` axios instance (`@/lib/axios`). This is the _only_
   layer allowed to touch raw/`unknown` response shapes. Normalizes
   backend inconsistency before returning.
3. **`services/mappers/*.mapper.ts`** — DTO → UI-facing domain type (e.g.
   `DocumentDto` → `PolicyDocument`). Domain types live in each module's
   `<module>-types.ts`.
4. **`hooks/use-*-queries.ts` / `use-*-mutations.ts`** — TanStack Query.
   - Queries: a `xQueryKeys` key factory object per domain, `select` used to
     apply the mapper, an explicit `enabled` param threaded from the caller
     (never default to `true` for anything requiring auth).
   - Mutations: call `queryClient.invalidateQueries({ queryKey:
xQueryKeys.all })` in `onSuccess`.
5. **`*Content.tsx` components** — client components owning data fetching
   for a route. **This exact shape repeats in every module** — copy it for
   new pages:
   ```tsx
   "use client";
   const [isClientReady, setIsClientReady] = useState(false);
   const [hasToken, setHasToken] = useState(false);
   useEffect(() => {
     setHasToken(Boolean(getAccessToken()));
     setIsClientReady(true);
   }, []);
   const someQuery = useXQuery({ ..., enabled: isClientReady && hasToken });
   // render order: boot/query loading spinner -> "sign in required" ->
   // query error (message + "Try again" button) -> "not found" -> the real
   // View component with fully-resolved props.
   ```
6. **`*View.tsx` / header / list / card components** — presentational only,
   take fully-resolved props, no data fetching, no query hooks.

**Auth helpers** (there are two overlapping ones — know which to reach for):

- `getAuthContext()` (`@/lib/auth-context.ts`) → `{ userId, subCompanyId,
organizationId, email, fullName }`. Use for identity (who is this user,
  what's their id) — e.g. permission checks like "is this user in
  `document.approverIds`".
- `getCurrentUser()` (`@/lib/current-user.ts`) → `{ userId, subCompanyId,
role }`, plus role-gate helpers (`canEditHazard()`,
  `canConvertNearMissToIncident()`, etc.) for the "elevated roles" (EHS
  Manager / Director / Lead) pattern used in hazard/near-miss modules.
  These two files independently decode the same JWT with slightly
  different claim-key fallback lists — this is existing duplication, not
  something to unify unless asked.
- `getAccessToken()` / `setAccessToken()` (`@/lib/axios.ts`) — raw token
  storage (in-memory + localStorage), used for the `isClientReady &&
hasToken` gate above. 401s trigger a coalesced silent refresh via
  `/Auth/refresh-token` (one in-flight refresh shared across concurrent
  401s, see `refreshAccessToken()`).

**Error messages**: `getMutationErrorMessage(error, fallback)` from
`@/hooks/use-auth-mutations` — unwraps `HttpError`/`ApiError`, otherwise
returns the fallback string.

## Styling conventions

Tailwind v4, tokens defined as CSS variables in `src/app/globals.css`
(`--color-ehs-*`), consumed as `text-ehs-*`/`bg-ehs-*`/`border-ehs-*`
classes (`ehs-blue`, `ehs-green`, `ehs-red`, `ehs-normal-blue`,
`ehs-dark-bg`, `ehs-muted-text`, `ehs-light-bg`, etc.) — grep
`app/globals.css` for the full token list before hardcoding a hex color.
Some newer Figma-matched components hardcode hex values directly in
classes instead (e.g. `text-[#0b1320]`) — both styles coexist; match
whichever the file you're editing already uses.

`Text.tsx` is the typography primitive — always pass `as="h1"|"h2"|"p"|
"span"|...` explicitly, don't use raw `<p>`/`<h1>` in new component code
inside modules that already use `Text`.

`components/ui/Button.tsx` has `variant="primary"|"secondary"|"tertiary"`.
`components/ui/Table.tsx` wraps TanStack Table with a consistent styled
shell — pass `columns`/`data`/`getRowId`, don't hand-roll `<table>`.

## Dev commands

```
npm run dev        # next dev
npm run build
npm run lint        # eslint
npm run lint:fix
npm run format       # prettier --write .
npx tsc --noEmit -p tsconfig.json   # typecheck (filter out .next/dev/types
                                     # noise — that's a stale generated file
                                     # issue unrelated to real code)
```

## Known gotchas

- **`sw.json` is stale.** It's a Swagger dump last touched 2026-07-21. It's
  missing endpoints already integrated in this codebase (dashboard-kpis,
  category-stats, `{id}/versions`, `versions/{id}/acknowledgements`, and
  more will keep being added ad hoc). Treat it as a rough cross-check only,
  never as proof an endpoint doesn't exist. The user pastes live Swagger
  snippets directly in chat when adding a new endpoint — that's the source
  of truth.
- **Don't invent endpoint URLs or request shapes.** Ask the user (they
  relay to the backend dev) rather than guess. This bit us on the document
  approval flow — see below.
- **Pre-existing ESLint error**: `react-hooks/set-state-in-effect` fires on
  the `setHasToken`/`setIsClientReady` pair inside the boot `useEffect` in
  _every_ `*Content.tsx` file across every module (checked: it's not new,
  not something to "fix" incidentally while touching a file for something
  else — it's an accepted existing pattern).
- **`node_modules/next/dist/docs/`** — check this before using any Next.js
  API you're not 100% sure still exists in this version.

## Session log — Policy Maker: Document Approval flow

### Done and working: `GET /api/Document/{documentId}/versions`

Fully wired into the Version History page (`VersionHistoryContent.tsx`).

- `document.service.ts`: `getDocumentVersions(documentId)`
- `use-document-queries.ts`: `documentQueryKeys.versions(documentId)`,
  `useDocumentVersionsQuery`
- `document-list.mapper.ts`: `mapVersionDto` (exported, was private)

### Blocked: `PUT /api/Document/DocApproval`

**Business flow** (confirmed by user): document created → approvers
approve it → only after approval can acknowledgers acknowledge it.

Request shape (`DocApprovalDto`, confirmed unchanged after a backend
update):

```json
{ "approveRowId": 0, "approverId": 0, "docVersionId": 0, "comments": "string" }
```

All 4 required; `comments` has `minLength: 1`.

**Implemented, matches the contract exactly:**

- `document-request.dto.ts`: `ApproveDocumentRequestDto`
- `document.service.ts`: `approveDocument(payload)` → `PUT /Document/DocApproval`
- `use-document-mutations.ts`: `useApproveDocumentMutation`
- `PolicyMakerDocumentDetailHeader.tsx`: "Approval" button only renders when
  `canApprove` is true; label switches Approval → Approving… → Approved.
- `PolicyMakerDocumentDetailView.tsx`: threads `canApprove`/`isApproved`/
  `isApproving` down to the header.
- `PolicyMakerDocumentDetailContent.tsx`: computes `canApprove` from
  `auth.userId` (via `getAuthContext()`) against `document.approverIds`. On
  click calls the mutation with **`approveRowId: 0`**, `approverId:
auth.userId`, `docVersionId: document.versionId`, `comments: "Approved"`
  (hardcoded default — user confirmed no comment input UI is needed).

**Why it's blocked**: `approveRowId: 0` always 400s —

```json
{
  "isError": true,
  "dataModel": null,
  "statusCode": 400,
  "success": false,
  "message": "Approval record not found",
  "errorDetails": null
}
```

— even immediately after creating a brand-new document. The backend looks
up an existing row rather than creating one from `0`. Given the confirmed
flow, a row must already exist per approver once a document is submitted —
same shape as acknowledgment, which already exists and works: ack rows are
fetched via `GET /Document/versions/{documentVersionId}/acknowledgements`,
matched to the current user (by name — no `userId` on those rows, see
`findMyAcknowledgement` in `services/mappers/acknowledgement.mapper.ts`),
and that row's `id` becomes `ackId` for `PUT /Document/Acknowledgement`.
Reference implementation: `AcknowledgeDocumentForm.tsx`.

**What's needed to unblock**: a GET endpoint listing approval rows for a
document/document version, each with its own real id. Exact path/shape is
backend's call — **user is checking with the backend developer**, no
answer yet as of this writing.

### Once the GET endpoint is provided, do this

1. Add a response DTO (`DocumentApprovalRowDto` or similar) to
   `document-response.dto.ts`, modeled on
   `DocumentAcknowledgementRowDto`/`GetDocumentAcknowledgementsResponseDto`.
2. Add `getDocumentApprovals(...)` to `document.service.ts`, same style as
   `getDocumentAcknowledgements`.
3. In `PolicyMakerDocumentDetailContent.tsx`'s `handleApproval`, before
   calling `approveMutation.mutateAsync`: fetch approval rows, find the row
   for the current user (prefer matching by `approverId` if present on the
   row — better than the name-matching fallback acknowledgment had to use),
   and use its real `id` as `approveRowId`. Fail closed (toast, don't call
   the mutation) if no match, like `findMyAcknowledgement` does.
4. Reconsider whether `document.approverIds` (comma-separated ids off
   `approvalUserIds`) should still drive `canApprove`, or whether the new
   approval-rows response (which may carry per-user status) should drive it
   instead.

### Known gap (not a bug)

No field on the document/version response indicates **persisted** approval
status. `isApproved` in `PolicyMakerDocumentDetailContent.tsx` is local
React state only — resets on reload even after a successful approval. Once
the approval-rows GET endpoint exists, hydrate `isApproved` from its
per-user status instead.
