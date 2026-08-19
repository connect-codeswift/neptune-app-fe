# RBAC — frontend guide

What changed in the API's roles and permissions, and what the web app has to do about it.

**Two things are breaking.** Everything else is additive or invisible.

---

## 1. Breaking — accept-invitation

The invite link changed shape. It used to be:

```
{origin}/accept-invitation?siteId=3&userId=147&email=x@y.com
```

It is now:

```
{origin}/accept-invitation?token=<opaque url-safe string>
```

`userId` was a sequential integer and `email` was known to whoever sent the invite, so
guessing an id set that person's password. The token is 64 random bytes, expires after
**7 days**, and is **single use**.

**`POST /api/User/accept-invitation`** — the request body changes:

```jsonc
// before
{ "userId": 147, "siteId": 3, "email": "x@y.com", "fullName": "...", "password": "..." }

// now
{ "token": "<from the query string>", "fullName": "...", "contactNo": "...", "profileUrl": "...", "password": "..." }
```

`userId`, `siteId` and `email` are gone — all three now come from the token's own row.

**The response now returns the email**, so you can still auto-login afterwards:

```jsonc
{ "success": true, "dataModel": { "email": "x@y.com" }, "message": "..." }
```

That matters because `auth.service.ts` logs the invitee straight in with
`authenticateUser({ email: payload.email, password: payload.password })` — and `payload.email`
no longer exists. Take it from the response instead. Without this the invitee has no session,
and the optional MFA step has nothing to attach the authenticator to.

The accept page must read `token` from the query string and forward it. An expired, used or
invalid token returns the same error deliberately, so the endpoint can't be used to probe
which invitations exist — show one generic "this invitation is no longer valid" message.

Password rule (relaxed, and now the same as registration): **8+ characters with a letter, a
digit and one non-alphanumeric.** It previously demanded an uppercase letter and restricted
symbols to `@$!%*?&`, so a password like `Hamid.123` was rejected here but accepted at signup.

> **Invites already sent stop working.** They carry no token. Those people need re-inviting.

---

## 2. Breaking — the role names changed

| Old             | New                        |
| --------------- | -------------------------- |
| `Ehs_Director`  | `Ehs_Director` — unchanged |
| —               | `Ehs_Lead` — **new**       |
| `Ehs_Manager`   | `Ehs_Manager` — unchanged  |
| `Ehs_Analyst`   | **`Supervisor`**           |
| `Ehs_Associate` | **`Worker`**               |
| `Admin`         | **removed**                |
| `Primary_Admin` | **removed**                |
| `Manager`       | **removed**                |

Anywhere the app compares a role name — route guards, conditional rendering, labels, filters
— must be updated. The role arrives in the JWT as the standard role claim.

> **Checked across all five repos: nothing compares a role name today.** The only match is a
> code comment in `ai-text.service.ts`. So this costs nothing right now — but the old names
> are dead, so anything written against them from here on will silently never match.

**`Primary_Admin` is gone entirely.** Whoever registers a company is now `Ehs_Director`.

**The admin portal is now `Ehs_Director` plus CodeSwift staff.** It used to be the `Admin`
role. A company owner still reaches Users, Roles, Sites, Dashboard and document categories,
scoped to their own organization. `Ehs_Lead` deliberately does **not** — a site-level
authority defining company-wide roles would rebuild the escalation the audit flagged.

> **Everyone must log out and back in after deploy.** Role and permission claims are baked
> into the token at login, so a user holding an old token will still say `Ehs_Analyst` and
> fail every gate naming `Supervisor`. Worth forcing a re-login rather than letting people
> discover it.

---

## 3. What each role can do

Use this to decide what to show. The API enforces it regardless.

|                                        | Director | Lead | Manager | Supervisor | Worker |
| -------------------------------------- | :------: | :--: | :-----: | :--------: | :----: |
| Admin portal (users, roles, sites)     |    ✓     |  —   |    —    |     —      |   —    |
| Everything else in the app             |    ✓     |  ✓   |    —    |     —      |   —    |
| Delete / drop records                  |    ✓     |  ✓   |    —    |     —      |   —    |
| Reopen a closed audit or inspection    |    ✓     |  ✓   |    —    |     —      |   —    |
| Templates (audit, inspection)          |    ✓     |  ✓   |    ✓    |     —      |   —    |
| PPE catalogue, LOTO equipment register |    ✓     |  ✓   |    ✓    |     —      |   —    |
| Set KPI targets                        |    ✓     |  ✓   |    ✓    |     —      |   —    |
| Close an incident                      |    ✓     |  ✓   |    ✓    |     —      |   —    |
| Create / update CAPA, RCA, compliance  |    ✓     |  ✓   |    ✓    |     ✓      |   —    |
| Report an incident                     |    ✓     |  ✓   |    ✓    |     ✓      |   —    |
| Apply / remove a lockout, issue PPE    |    ✓     |  ✓   |    ✓    |     ✓      |   —    |
| BBS observations, walk-and-talks       |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| Report a hazard or near miss           |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| Complete an audit / inspection         |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| Read safety data sheets (HazCom)       |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| See which machines are locked out      |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| Read controlled documents              |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |
| Request a PPE replacement              |    ✓     |  ✓   |    ✓    |     ✓      |   ✓    |

**A Worker cannot report an incident** — hazards and near misses only, by decision.

`Ehs_Lead` is the **site authority**: everything in the app, for the site they're on. Site
scope isn't a permission — it comes from the `SiteId` in the token, and
`POST /api/Auth/select-site` switches it (only to sites the user is assigned to).

---

## 4. `page:*` and `button:*` permissions

The token carries ~167 UI permission claims (`page:dashboard`, `button:report-hazard`, …).
**All five roles now receive all of them.**

That's a deliberate restore — a bug meant `Supervisor` and `Worker` received _none_ on newly
created companies, so those users saw no pages and no buttons at all.

The consequence: **these claims currently do no filtering.**

Checked across all five repos: **nothing reads them.** So nothing regresses — but it also
means the API does no UI gating at all. Hiding what a role can't use is entirely the
frontend's job, using the table in §3. Wiring the flags to real per-role values is a later
piece of work.

They're also no longer offered in the admin portal. `GET /SuperAdminRoles/permissions` used
to return all 245 rows, 167 of them these flags, so Roles & Rights showed 167 ticked
checkboxes that did nothing. It now returns the **78 permissions that actually gate an
endpoint**, across 18 categories. `GET /SuperAdminRoles/with-permissions` filters to match,
and saving a role no longer strips the hidden flags.

---

## 5. Endpoints that changed

### Removed — these now 404

| Endpoint                                      | Why                                                              |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `POST /api/Auth/assign-permissions`           | Ungated; let any logged-in user grant any permission to any role |
| `GET /api/Auth/all-Permissions`               | Fed the ids that made the above practical                        |
| `GET /api/Auth/AllRolesPermissions`           | Same                                                             |
| `POST /api/Auth/CreateRole`                   | Ungated role creation                                            |
| `GET /api/Auth/GetAllRoles`                   | Ungated                                                          |
| `GET /api/Auth/GetUsersByOrganizationId/{id}` | Took the org id from the URL — walked every company's roster     |
| `GET /api/Auth/GetSitesByOrganizationId/{id}` | Same                                                             |
| `DELETE /api/Auth/DeleteDemoUser/{id}`        | Ungated                                                          |

**Confirmed: none of the five frontends call any of them.** The only match anywhere is
`neptune-admin-fe/.docs/swagger.json`, a stale API spec — worth regenerating, but not code.
Role and user administration go through the `SuperAdmin*` controllers, which are gated and
organization-scoped, and `neptune-admin-fe/src/services/roles.service.ts` already uses them.

### Changed responses

**`GET /api/Auth/GetUserById/{id}`** now returns a projection, not the user row. It used to
include `passwordHash`, `totpSecret` and `resetOtp`. Fields now: `id`, `email`, `fullName`,
`contactNo`, `profileUrl`, `jobTitle`, `gender`, `roleId`, `roleName`, `organizationId`,
`siteId`, `isInvited`. Also now gated to Director / Lead / Manager.

**`GET /api/Auth/GetUsersBySiteId/{siteId}`** still takes `siteId` in the route and the URL
is unchanged, but the API now checks the caller is assigned to that site. Requesting a site
you aren't on returns an error rather than the roster.

### New permission names

If any screen lists or assigns permissions, these are new: `Compliance.Create`,
`Compliance.View`, `Compliance.Update`, `Compliance.Delete`, `PPE.Issue`, `PPE.Request`.

`PPE.Create` used to cover the catalogue, issuing, inspection _and_ a worker's own
replacement request. It now means the catalogue only — `PPE.Issue` covers issuing and
inspection, `PPE.Request` covers the replacement request.

### PPE acknowledgement — two callers, treated differently

**The emailed link** now carries a `token` alongside `issueId`, `org` and `siteId`, and the
API rejects it if any of the three are tampered with. If the app builds or rewrites this link
anywhere, pass `token` through untouched. **Links already in inboxes stop working.**

**The in-app page** (`/dashboard/ppe-management/acknowledgements`, via
`ppe.service.ts → acknowledgePpe`) needs no token and needs no change. An authenticated
caller's organization and site come from their JWT, so the API now ignores `org` and `siteId`
on the query string entirely for them.

That means `AcknowledgePpeParams` can drop `org` and `siteId` whenever it's convenient — they
are read from your token, not from what you send. Leaving them in place is harmless.

### PPE permissions split

`PPE.Create` used to gate the catalogue, issuing, inspection _and_ a worker's own replacement
request. Now: `PPE.Create` is the catalogue only, `PPE.Issue` covers issuing and inspection,
`PPE.Request` covers the replacement request. No route changed — only who can call them.

---

## 6. Demo module

`POST /api/DemoHosts/{id}/invite` now requires a CodeSwift staff session. It rotates the
host's password and clears their session, so it was previously a one-request lockout of any
host.

`POST /api/DemoHosts/{id}/mfa/setup`, `/mfa/enable` and `/mfa/disable` now require the host's
**password** in the request body. Identity plus an active session is no longer enough —
`GET /api/DemoHosts` is public and returns the email, so the old check was satisfiable by
anyone.

The rest of the demo surface is unchanged.

---

## Checklist

Verified against all five repos on 2026-08-12. Only the first three need doing.

**Must do — `neptune-app-fe` and `neptune-ehss-fe` (they are the same app at different stages):**

- [ ] `auth-request.dto.ts:73` — replace `siteId`, `userId`, `email` with `token`
- [ ] Accept-invitation page reads `token` from the query string and forwards it
- [ ] `auth.service.ts:140` — take the email for the auto-login from the **response**, not the request
- [ ] Generic error for invalid / expired / used invitation tokens

**Already fine — checked, no action:**

- [x] Role names — nothing compares them; only a code comment matches
- [x] The eight removed `Auth` endpoints — zero callers
- [x] `page:*` / `button:*` claims — nothing reads them
- [x] In-app PPE acknowledgement — works unchanged for authenticated users
- [x] Roles & Rights page — already on `SuperAdminRoles`, correctly gated
- [x] `neptune-host-fe`, `neptune-hub-fe` — untouched by any of this

**Worth doing, low priority:**

- [ ] `neptune-admin-fe/.docs/swagger.json` is stale — regenerate
- [ ] `user.service.ts:85` comment says `GetUserById` returns `passwordHash` / `totpSecret` / `resetOtp`; it no longer does
- [ ] Verify the `getUserById` session-bootstrap fallback still resolves `organizationName` and `siteName` from the JWT — the projection no longer returns them

**On deploy:**

- [ ] Force a re-login — role and permission claims are baked into the token
