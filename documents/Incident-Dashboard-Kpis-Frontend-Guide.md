# Incident Dashboard KPIs — Frontend Integration Guide

This guide documents how **GET `/api/Incident/dashboard-kpis`** is integrated in the Neptune EHSS frontend. It covers the API contract, file map, data flow, UI mapping, target/progress-bar behavior, and extension notes.

---

## Overview

| Item               | Detail                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Endpoint**       | `GET /api/Incident/dashboard-kpis`                                                             |
| **Auth**           | Bearer token (via shared `axios` client)                                                       |
| **Route**          | `/dashboard/incidents/dashboard`                                                               |
| **Companion APIs** | `GET /api/Incident/GetHeaderKpi` (hero row), `GET /api/Incident/kpi-targets` (target backfill) |

The dashboard page is split into two API-backed sections:

1. **Hero row** — RIR, LTIR, MTTC from `GetHeaderKpi` (+ `kpi-targets` fallback)
2. **Lower sections** — charts, indicator grid, injury mix from `dashboard-kpis` (+ `kpi-targets` fallback)

This guide focuses on **`dashboard-kpis`**.

---

## API contract

### Request

No query parameters or body. Tenant/site scope is inferred from the JWT on the backend.

### Response envelope

All incident KPI endpoints use the standard Neptune envelope:

```json
{
  "isError": false,
  "dataModel": {/* see below */},
  "statusCode": 200,
  "success": true,
  "message": "Incident dashboard KPIs fetched successfully",
  "errorDetails": null
}
```

The service throws if `success === false`.

### `dataModel` shape

```typescript
type IncidentDashboardKpisDto = {
  totalRecordable: number;
  lostTimeCount: number;
  restrictedWorkCount: number;
  medicalOnlyCount: number;
  firstAidCount: number;
  fatalityCount: number;
  lostDays: number;
  restrictedDays: number;
  siaCount: number;
  sipCount: number;
  recordablesBySite: { site: string; count: number }[];
  recordablesMonthly: {
    year: number;
    month: number;
    label: string;
    count: number;
  }[];
  recordableMix: {
    lostTime: number;
    restricted: number;
    medicalOnly: number;
    firstAid: number;
  };
  targets: Record<string, number>; // e.g. { rir: 7, mttr: 9 }
};
```

### Example response

```json
{
  "isError": false,
  "dataModel": {
    "totalRecordable": 4,
    "lostTimeCount": 0,
    "restrictedWorkCount": 0,
    "medicalOnlyCount": 0,
    "firstAidCount": 0,
    "fatalityCount": 0,
    "lostDays": 0,
    "restrictedDays": 0,
    "siaCount": 0,
    "sipCount": 0,
    "recordablesBySite": [
      { "site": "CodeSwift HQ", "count": 1 },
      { "site": "Plant A, Site 2", "count": 1 }
    ],
    "recordablesMonthly": [
      { "year": 2026, "month": 6, "label": "Jun", "count": 1 },
      { "year": 2026, "month": 7, "label": "Jul", "count": 2 }
    ],
    "recordableMix": {
      "lostTime": 0,
      "restricted": 0,
      "medicalOnly": 0,
      "firstAid": 0
    },
    "targets": {
      "rir": 7,
      "mttr": 9
    }
  },
  "statusCode": 200,
  "success": true,
  "message": "Incident dashboard KPIs fetched successfully",
  "errorDetails": null
}
```

---

## File map

| Layer      | File                                                                   | Responsibility                                              |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| DTO        | `src/dtos/res/incident-kpi-response.dto.ts`                            | `IncidentDashboardKpisDto`, nested row types, envelope type |
| Service    | `src/services/incident-kpi.service.ts`                                 | `getIncidentDashboardKpis()` — HTTP call + normalization    |
| Mapper     | `src/services/mappers/incident-dashboard.mapper.ts`                    | DTO → UI view model; indicator definitions; target lookup   |
| Hook       | `src/hooks/use-incident-kpi-queries.ts`                                | `useIncidentDashboardKpisQuery()`                           |
| UI shell   | `src/components/incidents/dashboard/IncidentKpisDashboard.tsx`         | Page layout (hero + sections + footnote)                    |
| UI data    | `src/components/incidents/dashboard/IncidentKpisDashboardSections.tsx` | Fetches data, loading/error states, renders wired sections  |
| Chart      | `src/components/incidents/dashboard/RecordableInjuriesChart.tsx`       | 12-month line chart                                         |
| Site bars  | `src/components/incidents/dashboard/RecordablesBySiteCard.tsx`         | YTD recordables by site                                     |
| Indicators | `src/components/incidents/dashboard/IndicatorCard.tsx`                 | KPI count cards + progress bars                             |
| Injury mix | `src/components/incidents/dashboard/InjuryMixCard.tsx`                 | Donut + legend                                              |
| Progress   | `src/components/incidents/dashboard/TargetProgress.tsx`                | Shared on/off-target bar                                    |

---

## Data flow

```
/dashboard/incidents/dashboard
  └─ IncidentKpisDashboard
       ├─ IncidentKpisHeroRow          → GET /Incident/GetHeaderKpi
       │                                 + GET /Incident/kpi-targets
       └─ IncidentKpisDashboardSections → GET /Incident/dashboard-kpis
                                          + GET /Incident/kpi-targets
            │
            ├─ mapIncidentDashboardKpisToViewModel(dto, kpiTargets)
            │
            ├─ RecordableInjuriesChart   ← viewModel.recordableChart
            ├─ RecordablesBySiteCard     ← viewModel.recordablesBySite
            ├─ IndicatorCard (×12)       ← viewModel.indicators
            └─ InjuryMixCard             ← viewModel.injuryMix + injuryMixTotal
```

### TanStack Query keys

```typescript
incidentKpiQueryKeys.dashboard(); // ["incident-kpis", "dashboard-kpis"]
incidentKpiQueryKeys.targets(); // ["incident-kpis", "targets"]
```

Both queries run in parallel inside `IncidentKpisDashboardSections` when the user has a valid access token.

---

## Normalization

`normalizeIncidentDashboardKpisDto()` in the mapper accepts raw `dataModel` and tolerates common backend casing drift:

- camelCase **and** PascalCase property names (`totalRecordable` / `TotalRecordable`)
- Invalid rows in arrays are dropped (missing site name, non-numeric count, etc.)
- Missing numeric fields default to `0`
- `targets` keys with non-numeric values are ignored
- Garbage keys like `"string"` in `targets` are filtered out during lookup build

---

## UI mapping

### Recordable injuries chart

| API field                                                                        | UI usage                             |
| -------------------------------------------------------------------------------- | ------------------------------------ |
| `recordablesMonthly[].label`                                                     | X-axis month labels                  |
| `recordablesMonthly[].count`                                                     | Red line series                      |
| `targets.monthlyRecordables` or `targets.recordablesMonthly` (via `kpi-targets`) | Green target line (hidden if absent) |

Additional behavior:

- Y-axis max scales dynamically (`max(series, target) × 1.15`, floor of 6)
- “Improving” / “Rising” badge compares last two months

### Recordables by site

| API field                   | UI usage                            |
| --------------------------- | ----------------------------------- |
| `recordablesBySite[].site`  | Row label                           |
| `recordablesBySite[].count` | Count + bar width (relative to max) |

### Indicator cards (12 total)

Definitions live in `INDICATOR_DEFINITIONS` inside `incident-dashboard.mapper.ts`.

| Card ID            | Title                     | Count field           | Target key            | Progress bar       | Direction     |
| ------------------ | ------------------------- | --------------------- | --------------------- | ------------------ | ------------- |
| `total-recordable` | Total Recordable Injuries | `totalRecordable`     | `totalRecordable`     | Yes                | lower-better  |
| `lost-time`        | Lost Time Count           | `lostTimeCount`       | `lostTimeCount`       | Yes                | lower-better  |
| `restricted-work`  | Restricted Work Count     | `restrictedWorkCount` | `restrictedWorkCount` | Yes                | lower-better  |
| `medical-only`     | Medical Only Count        | `medicalOnlyCount`    | `medicalOnlyCount`    | Yes                | lower-better  |
| `first-aid`        | First Aid Count           | `firstAidCount`       | —                     | No (footnote only) | —             |
| `fatality`         | Fatality Count            | `fatalityCount`       | `fatalityCount`       | Yes                | lower-better  |
| `lost-days`        | Lost Days                 | `lostDays`            | `lostDays`            | Yes                | lower-better  |
| `restricted-days`  | Restricted Days           | `restrictedDays`      | `restrictedDays`      | Yes                | lower-better  |
| `sia`              | SIA Count                 | `siaCount`            | `siaCount`            | Yes                | lower-better  |
| `sip`              | SIP Count                 | `sipCount`            | —                     | No (footnote only) | —             |
| `near-miss`        | Near Miss Count           | **not in API**        | `nearMissCount`       | Yes                | higher-better |
| `hazard-id`        | Hazard ID Count           | **not in API**        | `hazardIdCount`       | Yes                | higher-better |

**Featured row** (Figma layout): `sia`, `sip`, `hazard-id`, `near-miss` — rendered after grid padding via `partitionIndicatorMetrics()`.

### Injury mix donut

| API field                   | UI segment               |
| --------------------------- | ------------------------ |
| `totalRecordable`           | Center label (“RECORD.”) |
| `fatalityCount`             | Fatality segment (green) |
| `recordableMix.restricted`  | Restricted Work (teal)   |
| `recordableMix.lostTime`    | Lost Time (orange)       |
| `recordableMix.medicalOnly` | Medical Only (red)       |

`recordableMix.firstAid` is **not** shown in the donut — first aid has its own indicator card.

---

## Targets and progress bars

Progress bars are **always shown** on cards where `hasIndicator: true`, even when no target is configured.

### Target resolution order

1. `dataModel.targets` from `dashboard-kpis` (merged into lookup)
2. `GET /api/Incident/kpi-targets` rows (overlays / backfills by metric name)

Target keys are normalized:

- Case-insensitive
- `mttr` → `mttc` alias
- Known hero/list keys via `normalizeKpiMetricKey()` from `incident-kpi.mapper.ts`

### Progress bar states (`TargetProgress`)

| Condition                     | Bar               | Footer                 |
| ----------------------------- | ----------------- | ---------------------- |
| Target configured, on target  | Green fill        | “On / under target”    |
| Target configured, off target | Red fill          | “Off target”           |
| No target                     | Neutral gray stub | “No target configured” |

Cards **without** progress bars:

- **First Aid** — footnote: “Leading indicator · no target”
- **SIP** — footnote: “Leading indicator · no target”

---

## Loading and error handling

`IncidentKpisDashboardSections` mirrors the hero row pattern:

| State               | Behavior                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| Token bootstrapping | Skeleton placeholders for chart, site card, 13 indicator slots, injury mix |
| Loading             | Same skeletons while `dashboard-kpis` query is in flight                   |
| No token            | Error: “Please sign in to load incident dashboard KPIs.”                   |
| API error           | Error via `getMutationErrorMessage()`                                      |
| Success             | Live data rendered; empty arrays show inline empty copy where applicable   |

Hero row errors are independent — a failure in `dashboard-kpis` does not block hero KPIs.

---

## Related incident KPI endpoints

Already integrated elsewhere on the same dashboard module:

| Endpoint                            | Hook                           | UI                                            |
| ----------------------------------- | ------------------------------ | --------------------------------------------- |
| `GET /Incident/GetHeaderKpi`        | `useHeaderKpiQuery`            | Hero row (RIR, LTIR, MTTC)                    |
| `GET /Incident/kpi-targets`         | `useKpiTargetsQuery`           | Target backfill for hero + dashboard sections |
| `GET /Incident/GetIncidentListKpis` | `useIncidentListKpisQuery`     | Incident list KPI strip                       |
| `PUT /Incident/kpi-targets`         | `useSaveKpiTargetMutation`     | No admin UI yet                               |
| `GET /Incident/site-work-hours`     | `useSiteWorkHoursQuery`        | No UI yet                                     |
| `PUT /Incident/site-work-hours`     | `useSaveSiteWorkHoursMutation` | No UI yet                                     |

---

## Extending the integration

### Add a new indicator card

1. Add count/target fields to `IncidentDashboardKpisDto` when backend exposes them.
2. Append a definition to `INDICATOR_DEFINITIONS` in `incident-dashboard.mapper.ts`:
   - `countKey` — DTO numeric field
   - `targetKey` — lookup key (should match `kpi-targets` metric name)
   - `hasIndicator`, `direction`, optional `footnote` / `titleDot`
3. If the card belongs in the featured Figma row, add its `id` to `FEATURED_INDICATOR_IDS`.

### Add near-miss / hazard-id counts

When backend adds fields (e.g. `nearMissCount`, `hazardIdCount`) to `dashboard-kpis`:

1. Extend `IncidentDashboardKpisDto`.
2. Add `countKey` to the existing `near-miss` / `hazard-id` definitions.
3. Normalizer will pick them up automatically.

Target keys are already wired (`nearMissCount`, `hazardIdCount`).

### Invalidate cache after target save

When admin UI for `PUT /Incident/kpi-targets` is built, invalidate:

```typescript
queryClient.invalidateQueries({ queryKey: incidentKpiQueryKeys.targets() });
queryClient.invalidateQueries({ queryKey: incidentKpiQueryKeys.dashboard() });
queryClient.invalidateQueries({ queryKey: incidentKpiQueryKeys.header() });
```

---

## Manual verification checklist

- [ ] Sign in and open `/dashboard/incidents/dashboard`
- [ ] Hero row loads (separate API — sanity check)
- [ ] Chart shows 12 monthly labels from `recordablesMonthly`
- [ ] Site bars match `recordablesBySite`
- [ ] Indicator counts match API integers (formatted with commas)
- [ ] Cards with targets show green/red progress bars
- [ ] SIP / First Aid show footnote only (no bar)
- [ ] Near Miss / Hazard ID show `—` until backend adds counts; bar still renders if target exists in `kpi-targets`
- [ ] Injury mix center = `totalRecordable`; segments match mix + fatality
- [ ] Sign out → dashboard sections show auth error

---

## Swagger reference

Endpoint listed in `documents/swagger.json` under `/api/Incident/dashboard-kpis`. Response schema is minimal in swagger — treat this guide and `IncidentDashboardKpisDto` as the source of truth until backend schema is expanded.
