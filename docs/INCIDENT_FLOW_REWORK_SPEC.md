# Incident Report Flow Rework — Implementation Spec (test branch only)

Context: the intake report is the reporter's *best guess*. A separate closure
flow (out of scope here) produces the authoritative record after investigation.
Everything derivable at intake is derived and labeled as initial; EHS overrides
later.

## Severity (report-severity.ts)

OSHA 1904.7 / ANSI Z16.2 outcome classes — pick once on step 1, no default:

- `first-aid` — First Aid
- `medical-treatment` — Medical Treatment
- `restricted-duty` — Restricted Duty
- `lost-time` — Lost Time
- `fatality` — Fatality

Preview badges: first-aid → Low, medical-treatment → Medium, restricted-duty /
lost-time → High, fatality → Critical.

## Derivation (report-classification.ts)

| severity | OSHA Recordable | DART | SIA (intake) | Notification | SIP suggest |
|---|---|---|---|---|---|
| first-aid | No | No | Pending | manual | manual |
| medical-treatment | Yes | No | Pending | manual | manual |
| restricted-duty | Yes | Yes | Pending | manual | manual |
| lost-time | Yes | Yes | Pending | manual | manual |
| fatality | Yes | Yes | Yes | auto-Yes | suggest Yes |

- **SIP** — asked on step 4 as "SIF Potential?" (`classifications.serious`)
- **SIA** — derived at intake (fatality → Yes; else Pending until closure)
- **SIF** — computed: SIA Yes OR SIP Yes → Yes; SIA Pending + SIP No → No;
  SIA Pending + SIP unanswered → Pending
- Never ask SIA or SIF as pickers. Banner on steps 3–5 shows all five readouts.

## Step order

### 1 — What & where

Severity → Plant (auto) → Date / Time → Report date → Affected person
(site employee; gender auto from profile, never asked) → Temp / Non-Employee
Involved?

Assignee = signed-in user (reporter). Investigation workflow and CAPA are later
modules. Hospitalization / amputation / eye-loss structured fields are skipped
(notification Yes/No only).

### 2 — What happened

Object Involved → Mechanism of Injury → **Describe incident** (AI draft from
severity + object + mechanism) → Photos → Witnesses.

No Nature, no Treatment.

### 3 — Injury & treatment

Derived banner → Nature of Injury → Body part + injury description (unless
Nature = `none`) → Initial Treatment (**severity-gated**) → Secondary treatment.

### 4 — Classification & response

Same banner → Work Related → SIF Potential (SIP) → OSHA Notification →
Drug/Alcohol → Fleet → Emergency → Actions → Notes.

### 5 — Review & submit

Same derivation for badges + SIA / SIP / SIF.

## Severity → Initial Treatment

| Severity | Allowed options |
|---|---|
| first-aid | `first-aid-on-site`, `none` only (hard filter) |
| medical-treatment / restricted-duty / lost-time / fatality | all four |

Changing severity clears illegal treatment picks. Soft warning when a
non–first-aid severity still has only `none`.

## AI draft

`canDraftDescription` requires severity, object, and mechanism. Draft fires from
step 2 above the photos field once those answers stabilize.

## Preview

`/preview/incident-report` — no auth, no backend, submit disabled.
