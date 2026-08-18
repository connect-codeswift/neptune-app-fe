<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# neptune-app-fe — Neptune EHSS application

The main tenant-facing Environment, Health & Safety dashboard: incidents, near-miss, hazards,
CAPA, audits, inspections, BBS, walk & talk, HazCom, LOTO, PPE, policy maker, regulatory
compliance, fleet, emissions, analytics.

Repo: `connect-codeswift/neptune-ehss-fe`. Next.js 16 App Router · React 19 · TypeScript ·
Tailwind v4 · TanStack Query v5 · TanStack Table v8 · Redux Toolkit (wizards only) · axios.
React Compiler is **on** (`reactCompiler: true`) — do not add `useMemo` / `useCallback` / `memo`
for performance.

## Branches

Work on `hamid` → push `origin/hamid`. **`origin/dev` is the integration branch and holds the
latest** — branch from it and PR into it. `main` and `stag` trail behind.

The backend is `connect-codeswift/Neptune-Ehss-BE` (`origin/Staging` is its live branch). It serves
this app _and_ four others — never assume an endpoint exists only for us.

## Commands

```bash
npm run dev        # next dev
npm run build      # next build — the real typecheck
npm run lint       # eslint
npm run lint:fix
npm run format     # prettier
npx tsc --noEmit -p tsconfig.json   # typecheck; ignore .next/dev/types noise (stale generated)
```

There are **no tests**. Every task ends with all three checks green — typecheck, lint, build —
run as three concurrent agents reporting back to the orchestrator. The full rule, including the
accepted lint baseline, is [.cursor/rules/verify-before-done.mdc](.cursor/rules/verify-before-done.mdc)
(mirrored as the `verify-before-done` skill). `npm run lint` does not exit 0 on a clean tree; the
test is the delta against that baseline, not the total.

`HANDOFF.md` is a point-in-time session note, not a rules file — its conventions are folded into
this document, and where the two disagree, this one is current. Its session log (the blocked
`PUT /api/Document/DocApproval` flow, which needs a backend GET returning real approval-row ids)
may or may not still be live; check before acting on it.

## Environment

`.env` holds local values. The browser calls the same-origin path `/api`
(`NEXT_PUBLIC_API_BASE_URL=/api`); `next.config.ts` rewrites that to `API_PROXY_TARGET`
(staging backend by default). So a "CORS error" here usually means the rewrite target is wrong,
not the backend.

Uploads go to Cloudinary **client-side first** (`src/lib/upload-to-cloudinary.ts`); only the
resulting URL is sent to the API — that is what every `pdfPath` / `filePath` field holds.

## Data layer — one-way chain, do not skip a link

```
src/dtos/req/<domain>-request.dto.ts  ·  src/dtos/res/<domain>-response.dto.ts
        ↓
src/services/<domain>.service.ts       axios (`http` from @/lib/axios); one exported async
                                       function per endpoint, JSDoc'd with METHOD /Path.
                                       The ONLY layer allowed to touch raw/unknown shapes.
        ↓
src/services/mappers/<domain>.mapper.ts    DTO → UI domain type
        ↓
src/hooks/use-<domain>-queries.ts / -mutations.ts    "use client"; TanStack Query
        ↓
src/components/<module>/<Thing>Content.tsx → presentation components
```

- Every backend response is wrapped in `ApiEnvelopeDto<T>`
  (`src/dtos/res/api-envelope.dto.ts`): `statusCode` / `success` / `message` / `isError` /
  `errorDetails` / `dataModel`. Unwrap it in the service — never read `.dataModel` in a
  component.
- The backend is ASP.NET and its casing is inconsistent — camelCase and PascalCase appear even
  within one payload. Every service normalizes this with small coercion helpers
  (`isRecord` / `readProp` / `asNumber` / `asString` / `asBoolean`) declared **per service file**.
  That duplication is the existing pattern; do not hoist it into a shared util unasked.
- **Query keys are a `<domain>QueryKeys` factory object** exported from the queries file
  (`capaQueryKeys`, `incidentQueryKeys`, `documentQueryKeys`, …) with an `all` key plus one
  entry per query. Queries apply the mapper via `select` and thread an explicit `enabled` —
  never default `enabled` to `true` for anything requiring auth. Mutations invalidate
  `<domain>QueryKeys.all` in `onSuccess`.
- UI domain types live next to the module that owns them, in
  `src/components/<module>/<module>-types.ts`.
- `src/store/` is Redux Toolkit and is **only** for the multi-step builder wizards
  (`audit-slice`, `audit-template-slice`, `inspection-template-slice`). Everything else is
  TanStack Query for server state and `useState` for local state. Do not add slices for data
  the API owns.
- **`<Thing>Content.tsx` is the repeated route shape** — a client component that owns data
  fetching for one route, with the page file staying thin. There are ~36 of them; copy the
  nearest one rather than inventing a new arrangement.

**The API contract is `FEGuides/<Module>.md` in `connect-codeswift/Neptune-Ehss-BE`.** Read the guide before
wiring an endpoint; if the contract is not there, it does not exist — ask the backend rather
than guessing at shapes. `sw.json` at the repo root is a Swagger dump and is **stale** — a rough
reference at best, never the contract.

### The `*Content.tsx` boot gate

Every `*Content.tsx` opens with the same client-boot pattern, and queries stay disabled until it
resolves:

```tsx
"use client";
const [isClientReady, setIsClientReady] = useState(false);
const [hasToken, setHasToken] = useState(false);
useEffect(() => {
  setHasToken(Boolean(getAccessToken()));
  setIsClientReady(true);
}, []);
const someQuery = useXQuery({ …, enabled: isClientReady && hasToken });
```

Render order is fixed: boot/query spinner → "sign in required" → query error (message +
"Try again") → "not found" → the real `*View` component with fully-resolved props.

`*View.tsx` / header / list / card components are **presentational only** — resolved props in,
no fetching, no query hooks.

> This pattern trips `react-hooks/set-state-in-effect` in every `*Content.tsx` in the repo. It
> is a pre-existing, accepted lint error — do not "fix" it while touching a file for something
> else.

## Auth, session, permissions

- `src/lib/axios.ts` owns tokens (`neptune-access-token` / `neptune-refresh-token` in
  localStorage, mirrored in memory), the request interceptor, and `HttpError`. A 401 triggers a
  **coalesced** silent refresh via `/Auth/refresh-token` — one in-flight refresh shared across
  concurrent 401s (`refreshAccessToken()`). Don't add a second refresh path.
- The response interceptor also handles the **org access window** — a tenant whose trial or
  access window has expired (`src/lib/access-window.ts`) is redirected to login with a message
  rather than a bare 401.
- `src/components/AppShell.tsx` is the auth gate: no access token → replace to `/login`. It owns
  the sidebar and the organization-limits banner.
- Permissions are `Module.Action` strings read off the JWT (`src/lib/jwt-permissions.ts`). Gate
  UI on them — a button the backend will 403 should not render. The backend enforces role
  **and** permission, so a permission check here is a UX affordance, not a security boundary.
- **Two overlapping identity helpers — know which you want.** `getAuthContext()`
  (`@/lib/auth-context.ts`) → `{ userId, subCompanyId, organizationId, email, fullName }`, for
  identity questions ("is this user in `document.approverIds`"). `getCurrentUser()`
  (`@/lib/current-user.ts`) → `{ userId, subCompanyId, role }` plus the elevated-role gates
  (`canEditHazard()`, `canConvertNearMissToIncident()`, …) used by hazard and near-miss. Both
  decode the same JWT with slightly different claim-key fallbacks; that duplication is existing,
  not something to unify unasked.
- Mutation errors: `getMutationErrorMessage(error, fallback)` from `@/hooks/use-auth-mutations`
  unwraps `HttpError` / `ApiError` and otherwise returns the fallback.
- Licensed modules and the sidebar come from `GET api/Auth/Org/me` via
  `src/lib/ehs-modules.ts` / `src/lib/app-nav.ts`. Adding a dashboard route means registering it
  there, not just creating the folder.

## Routes

`src/app/dashboard/<module>/…` mirrors the sidebar one-to-one. `(auth)` and `(legal)` are route
groups (no URL segment). Keep the folder name, the sidebar entry, and the module key in
`ehs-modules.ts` in agreement.

## Components

`src/components/<module>/` — one folder per feature, matching the route module.
`src/components/ui/` — shared primitives only: `Button`, `IconButton`, `TextButton`, `Table`
(TanStack Table + `table-columns.ts` helpers), `GlassCard`, `GlassSelect`, `MetricCard`,
`ConfirmDialog`, `Toggle`, `Accordion`, `Skeleton` / `skeletons.tsx`, `NeptuneLoader`,
`ModuleSearchBar`, `ModuleFilterBar`, `field-styles.ts`.

`src/components/Text.tsx` is the typography primitive — always with an explicit
`as="h1" | "h2" | "p" | "span" | …`. Inside modules that already use `Text`, don't drop back to
raw `<p>` / `<h1>`. `ui/Button.tsx` has `variant="primary" | "secondary" | "tertiary"`.
`ui/Table.tsx` wraps TanStack Table with the shared styled shell — pass
`columns` / `data` / `getRowId`; never hand-roll a `<table>`.

Check `ui/` before building a control. Icons are `@iconify/react` (`<Icon icon="mdi:…" />`);
toasts go through `src/lib/toast.ts` (sonner), not `sonner` directly. `"use client"` only where
actually needed.

### Props must be `Readonly` (Sonar S6759)

Every component under `src/components/` takes a single `props` parameter typed
`Readonly<XProps>`, with the props type itself wrapped in `Readonly<…>`. See
[.cursor/rules/react-readonly-props.mdc](.cursor/rules/react-readonly-props.mdc).

```tsx
export type MyComponentProps = Readonly<{ label: string; onClick?: () => void }>;

export function MyComponent(props: Readonly<MyComponentProps>) {
  const { label, onClick } = props;
  …
}
```

## Styling — Tailwind v4

No `tailwind.config.js`. Tokens are declared in `@theme inline` in `src/app/globals.css` and all
carry the `ehs-` prefix: `ehs-normal-blue` (+ `-hover` / `-active` / `-bg-light`),
`ehs-light-blue`, `ehs-dark-blue`, `ehs-navy`, `ehs-green` / `-red` / `-yellow` / `-purple`,
`ehs-border`, `ehs-muted-text`, `ehs-gray`, `ehs-slate`, `ehs-light-bg` / `ehs-dark-bg`. Grep
`globals.css` for the full list before hardcoding a hex. Some newer Figma-matched components
hardcode hex directly (`text-[#0b1320]`) — both styles coexist; match whichever the file you are
editing already uses rather than converting it mid-task. Numeric radius tokens (`rounded-2.5` /
`-3` / `-4` / `-5`) exist because Tailwind's named scale stops short — keep them defined.

Spacing, Figma values, and gradients: [.cursor/rules/tailwind-v4-utilities.mdc](.cursor/rules/tailwind-v4-utilities.mdc).
The short version — never paste fractional MCP/Figma px (`12.75`, `9.73`); round to the nearest
integer then to the 4px scale (`h-[180px]` → `h-45`); use `bg-linear-to-*`, not
`bg-gradient-to-*`.

## Layout reference

```
src/app/            (auth)/ (legal)/ dashboard/<module>/ · globals.css
src/components/     <module>/ (incl. <Thing>Content.tsx + <module>-types.ts) · ui/ · inputs/
                    providers/ · AppShell.tsx · DashboardSidebar.tsx · Text.tsx
src/services/       <domain>.service.ts · mappers/<domain>.mapper.ts
src/hooks/          use-<domain>-queries.ts · use-<domain>-mutations.ts
src/lib/            axios.ts (default export `http`) · toast.ts · map-*.ts · jwt-permissions.ts
                    access-window.ts · ehs-modules.ts · app-nav.ts · upload-to-cloudinary.ts
                    query-client.ts
src/dtos/           req/<domain>-request.dto.ts · res/<domain>-response.dto.ts
                    res/api-envelope.dto.ts (the wrapper every endpoint uses)
src/store/          Redux Toolkit — builder wizards only
sw.json             stale Swagger dump — not the contract
```
