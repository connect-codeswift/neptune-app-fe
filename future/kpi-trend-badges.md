# KPI trend badges (restored)

**Status:** Live again since Aug 2026. `SHOW_KPI_TREND_BADGES` and
`src/lib/kpi-display-flags.ts` are gone — the kill switch existed because
badges could contradict the data behind them, and the shared card now makes
that impossible by construction.

## Why the flag went away

The badges were hidden in Aug 2026 because backend `trendDelta` values were
not reliable, and some cards showed gap-to-target dressed up as a
period-over-period trend. `src/components/ui/MetricCard.tsx` closes both holes:

- **The delta comes from the sparkline series.** If a card draws a trend line,
  its badge is `last − first` of that same series. Badge and line cannot
  disagree, because there is only one number.
- **An explicit `delta` is only read when there is no series.** That is the
  path for endpoints that return a period delta and nothing else (hazard,
  near miss).
- **No delta, no delta badge.** Cards with neither series nor delta fall back
  to an icon badge, so a snapshot endpoint can never imply movement.

Synthetic sparklines were deleted with the flag. `dashboard.mapper.ts` used to
fabricate a seven-point ramp off the current value; under the rule above that
would have manufactured a trend, so those cards now render without a line.

## Colour

`signalOwnedBy` picks what drives red/green, and only colour:

| `signalOwnedBy`              | Green when                                                    |
| ---------------------------- | ------------------------------------------------------------- |
| `"isMorePositive"` (default) | the delta's sign matches `isMorePositive`                     |
| `"target"`                   | the value meets `target`, with polarity from `isMorePositive` |

`"target"` falls back to `"isMorePositive"` when no numeric `target` is set. A
delta of zero is neutral (grey), not green — nothing moved. The arrow always
follows the sign of the delta regardless of colour, and the sparkline takes
the badge's colour.

## Still open on the backend

1. Ship real series (`trend[]`) on the endpoints that only return snapshots:
   `GetMainDashboardKpis` compliance/CAPA, BBS, Walk & Talk, PPE, audits,
   inspections, compliance dashboard KPIs. Each is an icon badge until then.
2. Document the period each `trendDelta` covers, then add the suffix to the
   card copy (e.g. "vs prior 30d") in one place.
