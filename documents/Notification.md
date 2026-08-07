# Notification API — frontend guide

For wiring the dashboard bell in `neptune-ehss-fe`. The backend is merged; **no frontend
work has been done at all**. Everything below is verified against a running instance, not
inferred from the code.

## What exists today on the frontend

The bell is already rendered — `src/components/DashboardHeader.tsx:109` (`NotificationsButton`),
driven by two props on `DashboardHeaderProps`:

```ts
onNotificationsClick?: () => void;
hasUnreadNotifications?: boolean;
```

Both are currently fake. `hasUnreadNotifications` is passed as a bare literal on ~11 dashboard
pages (`src/app/dashboard/near-miss/page.tsx:95`, `hazard/page.tsx:103`, `audits/page.tsx:67`,
and others), and nothing anywhere handles `onNotificationsClick`. Replacing those literals with
real state is the job.

Note `DashboardHeader.tsx:155` — the bell only renders when at least one of the two props is
defined, so passing neither hides it entirely.

## Endpoints

Base path `/api/notification`. All four require a bearer token; caller identity comes from the
JWT, so **never send a userId or subCompanyId** — the server ignores anything you send and uses
the token.

| Method | Path                                                                  | Permission            |
| ------ | --------------------------------------------------------------------- | --------------------- |
| GET    | `/api/notification?unreadOnly={bool}&pageNumber={int}&pageSize={int}` | `Notification.View`   |
| GET    | `/api/notification/unread-count`                                      | `Notification.View`   |
| PUT    | `/api/notification/{id}/read`                                         | `Notification.Update` |
| PUT    | `/api/notification/read-all`                                          | `Notification.Update` |

Defaults: `unreadOnly=false`, `pageNumber=1`, `pageSize=20`.

Both permissions are granted to all six roles (`Admin`, `Manager`, `Ehs_Manager`,
`Ehs_Director`, `Ehs_Analyst`, `Ehs_Associate`), so every logged-in user has a working bell.

## Response shapes

Standard `ResponseModel` envelope, same as every other module. These are real responses:

**GET `/api/notification`**

```json
{
  "isError": false,
  "dataModel": {
    "data": [
      {
        "id": 3,
        "type": "Capa.Assigned",
        "title": "CAPA assigned: Guard rail",
        "message": "You have been assigned the Guard rail CAPA.",
        "entityType": "Capa",
        "entityId": 202,
        "isRead": false,
        "createdAt": "2026-07-30T22:45:10.123Z"
      }
    ],
    "totalRecords": 2,
    "pageNumber": 1,
    "pageSize": 20
  },
  "statusCode": 200,
  "success": true,
  "message": "Notifications fetched successfully",
  "errorDetails": null
}
```

**GET `/api/notification/unread-count`**

```json
{
  "isError": false,
  "dataModel": { "count": 2 },
  "statusCode": 200,
  "success": true,
  "message": "Unread notification count fetched successfully",
  "errorDetails": null
}
```

**PUT `/api/notification/{id}/read`** → `dataModel` is `{ id, isRead, readAt }`.
**PUT `/api/notification/read-all`** → `dataModel` is `{ updatedCount }`.

Ordering is newest first, tie-broken by `id` descending — a role broadcast writes several rows
in the same transaction with identical `createdAt`, so don't re-sort client-side on `createdAt`
alone or paging will jump.

## `type` and `entityType` values

`entityType` + `entityId` are there so a row can deep-link. Map them to routes:

| `type`                  | `entityType`   | `entityId` points at      |
| ----------------------- | -------------- | ------------------------- |
| `Hazard.Assigned`       | `Hazard`       | the hazard                |
| `Capa.Assigned`         | `Capa`         | the CAPA                  |
| `Audit.Assigned`        | `Audit`        | the audit run             |
| `Audit.FindingAssigned` | `AuditFinding` | the finding               |
| `Compliance.Assigned`   | `Compliance`   | the compliance obligation |
| `Incident.Reported`     | `Incident`     | the incident              |
| `NearMiss.Reported`     | `NearMiss`     | the near miss             |

Treat this list as open — handle unknown `type` values by falling back to `title`/`message`
rather than throwing, since new producers will be added.

The first five go to one assignee. `Incident.Reported` and `NearMiss.Reported` are broadcasts to
every `Ehs_Manager`/`Ehs_Director` in the tenant, so several users see the same event, and a
manager who reports an incident himself is deliberately **not** notified about it.

## Suggested wiring

Follow the existing module layout: `src/dtos/req|res/`, `src/services/*.service.ts`,
`src/hooks/use-*-queries.ts` / `use-*-mutations.ts`.

`src/services/notification.service.ts` — path constants + `http` from `@/lib/axios`, matching
`hazard.service.ts`:

```ts
const NOTIFICATION_LIST_PATH = "/notification";
const NOTIFICATION_UNREAD_COUNT_PATH = "/notification/unread-count";
const NOTIFICATION_READ_ALL_PATH = "/notification/read-all";
```

`src/hooks/use-notification-queries.ts` — the count is the poll; the list is fetched only when
the panel opens:

```ts
export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: ["notification", "unread-count"] as const,
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 60_000,
  });
}

export function useNotificationListQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["notification", "list"] as const,
    queryFn: () => getNotifications({ pageNumber: 1, pageSize: 20 }),
    enabled,
  });
}
```

On mark-read / read-all, invalidate both `["notification", "unread-count"]` and
`["notification", "list"]`.

Then replace the hardcoded literals: `hasUnreadNotifications={(count ?? 0) > 0}` and an
`onNotificationsClick` that opens the panel. Doing this once in a shared wrapper is better than
editing all ~11 pages, but that is a frontend structural call.

Pick a polling interval deliberately — `unread-count` is a single indexed `COUNT` scoped to
`(SubCompanyId, UserId, IsRead)`, so it is cheap, but it is still one request per user per
interval. Consider pausing on hidden tabs.

## What the backend does not do

Deliberately out of scope — do not design around these existing:

- **No real-time push.** No SignalR hub for notifications. Polling is the only mechanism.
- **No dismiss or delete endpoint.** Read/unread is the only state. The entity has an `IsDrop`
  soft-delete column but nothing exposes it.
- **No email or push fan-out.**
- **No "mark unread".**
- **No grouping or digesting.** A broadcast produces one row per recipient.

## Behaviour worth knowing

- Marking a notification read twice is idempotent — same `readAt`, still 200. Safe to fire on
  render without debouncing.
- `PUT /{id}/read` for someone else's notification returns **404**, not 403. Don't treat a 404
  here as "deleted" — it also means "not yours".
- `read-all` only touches the caller's rows.
- A user never sees another user's notifications, even inside the same tenant, and never sees
  another tenant's at all.
- Assigning something to yourself produces no notification, so an empty bell right after you
  created something is correct.
