# KPI trend badges (removed — re-add later)

**Status:** Hidden via `SHOW_KPI_TREND_BADGES = false` in `src/lib/kpi-display-flags.ts` (Aug 2026).

## What was removed

Green/red **period-over-period delta pills** with up/down arrow icons on KPI stat cards, for example:

- `+12` / `-3` with `mdi:trending-up` / `mdi:trending-down`
- Command-center cards showing gap-to-target as if it were a trend (`+3pp`, `-0.4`)
- Compliance register KPI delta badges (`ComplianceDeltaBadge`)

These implied “vs last period” or directional movement, but backend `trendDelta` / prior-period series are **not configured reliably** yet.

## What was kept

| UI | Reason |
|----|--------|
| **Target labels** (`Target ≤ 2.5`, etc.) | Static thresholds from KPI targets API |
| **Mini sparklines** | Decorative; can be revisited separately |
| **Hero KPI “On target / Off target”** (`HeroKpiCard`) | Status from API `status`, not period delta |
| **Policy Maker stat pills** (`StatMetricCard` — “Needs action”, “Clear”) | Semantic labels, not up/down trends |
| **Chart-level “Improving / Rising”** (`RecordableInjuriesChart`) | Separate from list KPI row badges |

## Components gated by the flag

| File | Control |
|------|---------|
| `src/components/incidents/list/IncidentListKpiCard.tsx` | Arrow + `trendValue` pill |
| `src/components/KpiMetricCard.tsx` | Arrow + `trendValue` pill (EHS Command Center) |
| `src/components/regulatory-compliance/compliance-ui.tsx` | `ComplianceDeltaBadge` |

## Data sources (when re-enabling)

| Screen | API / mapper | Trend field |
|--------|----------------|-------------|
| Incident list KPIs | `GET /api/Incident/GetIncidentListKpis` | `trendDelta`, `trend[]` on each card |
| Incident dashboard hero | `GET /api/Incident/GetHeaderKpi` | `trend[]`, `status` |
| EHS Command Center | `GET /api/EHSCommandCenter/GetMainDashboardKpis` | No real history — mapper synthesizes gap-to-target as “trend” |
| Regulatory compliance KPIs | Compliance summary mappers | `badgeValue` on `ComplianceKpiItem` |
| Legacy client-only fallback | `buildIncidentListKpis()` in `incident-list-data.ts` | Computed from current page rows (deprecated path) |

## Re-enable checklist

1. Set `SHOW_KPI_TREND_BADGES = true` in `src/lib/kpi-display-flags.ts`.
2. **Backend:** Ensure each KPI card returns a correct prior-period baseline and signed `trendDelta` (percent or absolute, documented per metric).
3. **Command center:** Either add real time-series to `GetMainDashboardKpis` or keep showing target gap only (different copy — not “vs last period”).
4. **Incident KPIs:** Confirm `lower-better` vs `higher-better` direction in `incident-kpi.mapper.ts` `resolveListTrend()` matches business rules.
5. **Copy:** Standardize label suffix (e.g. “vs prior 30d”) once period length is fixed in the API.
6. **Skeletons:** Restore rounded pill placeholders in `SkeletonKpiRow` / `KpiMetricCardSkeleton` if desired.

## Reference — previous badge props

```tsx
// IncidentListKpiCard / KpiMetricCard
{
  trendValue: "+12",
  trendDirection: "up",
  trendTone: "negative", // depends on metric direction
}
```

Toggle location:

```ts
// src/lib/kpi-display-flags.ts
export const SHOW_KPI_TREND_BADGES = false;
```
