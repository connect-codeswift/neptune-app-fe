# Global header utilities (removed — re-add later)

**Status:** Temporarily removed from all app-fe dashboard headers (Aug 2026).

## What was removed

Three placeholder controls appeared in most page headers:

| Control                   | Purpose (planned)                                                               | Typical placeholder                              |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Global search**         | Fuzzy search across incidents, CAPAs, documents, users, messages; `⌘K` shortcut | `"Search incidents, actions, docs…"`             |
| **Date range / calendar** | Filter page data by reporting period                                            | `"Year to date"` / `"March 25 — April 24, 2026"` |
| **Notification bell**     | Unread alerts inbox                                                             | Red dot when unread                              |

These were mostly non-functional UI shells (toasts or no-op handlers).

## Components affected

### Shared

- `src/components/DashboardHeader.tsx` — primary shell for module pages
- `src/components/incidents/list/IncidentListHeader.tsx` — incidents, policy maker, some compliance screens
- `src/components/regulatory-compliance/CompliancePageHeader.tsx`
- `src/components/incidents/dashboard/IncidentKpisHeader.tsx` — date-range picker only (site switcher + export kept)
- `src/components/incidents/detail/shared/IncidentDetailHeader.tsx`
- `src/components/incidents/report/shared/ReportIncidentToolbar.tsx` — now returns `null`
- `src/components/policy-maker/detail/PolicyMakerDocumentDetailView.tsx`

### Call sites

Most routes under `src/app/dashboard/**` passed `searchPlaceholder`, `dateRangeLabel`, and `hasUnreadNotifications` into `DashboardHeader`. Module-specific headers duplicated the same cluster.

## Re-implementation checklist

1. **Extract shared primitives** (avoid copy-paste across headers):
   - `GlobalSearchField` — controlled input, `⌘K` focus, optional command palette
   - `HeaderDateRangeButton` — popover wired to page/query date filters
   - `HeaderNotificationsButton` — unread count from notifications API

2. **Wire real data**
   - Search: client-side v1 across already-loaded lists, or dedicated search API
   - Date range: connect to each module’s React Query params (incidents KPIs already have date filtering hooks)
   - Notifications: `Notification.View` permission + backend unread endpoint

3. **Restore in `DashboardHeader` first**, then module headers that don’t use it.

4. **Page-specific search** (removed with global search in some screens):
   - Incident list (`IncidentsListPageClient`) — consider a filter-bar search, not global header search
   - Policy Maker document library — table or library-nav scoped search
   - CAPA register — list toolbar search

5. **Feature flag (optional):** `NEXT_PUBLIC_ENABLE_GLOBAL_HEADER_UTILITIES=true` during rollout.

## Reference — previous `DashboardHeader` props

```tsx
<DashboardHeader
  title="Module name"
  searchPlaceholder="Search incidents, actions, docs..."
  searchValue={query}
  onSearchChange={setQuery}
  searchonleft={false}
  dateRangeLabel="Year to date"
  onDateRangeClick={() => {}}
  hasUnreadNotifications
  onNotificationsClick={() => {}}
  showSiteSwitcher
  actionLabel="Primary action"
  onActionClick={() => {}}
/>
```

## Related product notes

- Hub overview dashboard spec (host/hub repo) describes a similar quick-search + activity feed pattern for collaboration users — align UX/copy when re-adding globally in app-fe.
- Incident KPI header retains **site switcher** and **Export**; only the calendar date-range control was removed there.
