---
name: verify-before-done
description: Fan out three agents — one running typecheck, one lint, one build — collect their reports and loop until all are clear. Use at the end of every task that touched code, before reporting the work as done, and whenever asked to verify, check or confirm a change builds.
---

<!-- Mirror of .cursor/rules/verify-before-done.mdc — edit both, keep the bodies identical. -->

# Verify before calling a task done

No task is finished until all three checks are green:

| Check | Command |
| --- | --- |
| typecheck | `npx tsc --noEmit -p tsconfig.json` |
| lint | `npm run lint` |
| build | `npm run build` |

There are no tests in this repo. These three are the whole safety net, so none is optional and
none is "probably fine".

## Fan out — one agent per check

Run all three **concurrently**, one subagent each, launched in a single message so they start
together rather than queueing. `npm run build` dominates the wall clock; typecheck and lint
finish inside it for free.

```
          ┌─ agent: typecheck ─┐
orchestrator ─┼─ agent: lint ──────┼─→ orchestrator collects verdicts → fixes → re-runs
          └─ agent: build ─────┘
```

**Each agent is a read-only reporter.** Its whole job is: run its one command, and report what
happened. It must not edit a file, fix a problem, or run the other two commands. Three agents
editing the same working tree at once will clobber each other, and an agent that "helpfully"
fixed something the orchestrator never saw is worse than a red check.

Give each agent this report format so the verdicts are comparable:

```
CHECK:    typecheck | lint | build
STATUS:   PASS | FAIL
EXIT:     <exit code>
PROBLEMS: <error/warning counts, or "none">
OUTPUT:   <the failing lines, verbatim — do not summarize or paraphrase them>
```

The **orchestrator** owns everything after that: it reads the three reports, fixes the causes
itself, and re-runs. Re-run only the checks that failed plus any a fix could plausibly have
broken — a fix for a type error warrants typecheck and build, not necessarily lint. Loop until
all three report PASS.

One ordering caveat: `next build` writes `.next/`, and typecheck reads generated types from
there. If the typecheck agent reports errors that live only under `.next/types` or
`.next/dev/types`, they are stale-generated-file noise from the concurrent build — not real.
Re-run typecheck alone once the build has finished before believing them.

## What "cleared" means

| Check | Cleared when |
| --- | --- |
| `tsc --noEmit` | exit 0, no errors |
| `npm run lint` | **no problem your change introduced** — the repo has a known baseline, below |
| `npm run build` | exit 0, build completes |

`npm run lint` does **not** exit 0 on a clean tree. Baseline as of 2026-08-18 (commit `268402b`
plus the Prettier and Tailwind v4 lint rules): **13 errors, 1269 warnings**.

| Rule | Severity | Count | Status |
| --- | --- | --- | --- |
| `prettier/prettier` | warning | 1064 | Formatting debt — auto-fixable, cleared file-by-file |
| `no-restricted-syntax` (fractional px, v3 gradients) | warning | 135 | Tailwind v4 convention debt |
| `tailwindcss/important-modifier-suffix` | warning | 35 | Tailwind v4 convention debt — auto-fixable |
| `tailwindcss/no-unnecessary-arbitrary-value` | warning | 18 | Tailwind v4 convention debt — auto-fixable |
| `react-hooks/set-state-in-effect` | error | 11 | Accepted — the `*Content.tsx` boot gate. `AGENTS.md` says do not fix it |
| `tailwindcss/no-contradicting-classname` | warning | 8 | Tailwind v4 convention debt |
| `@typescript-eslint/no-unused-vars` | warning | 5 | Pre-existing |
| `react-hooks/preserve-manual-memoization` | error | 2 | Pre-existing |
| `tailwindcss/enforces-negative-arbitrary-values` | warning | 2 | Tailwind v4 convention debt |
| `react-hooks/exhaustive-deps` | warning | 1 | Pre-existing |
| `@next/next/no-img-element` | warning | 1 | Pre-existing |

(13 errors = 11 + 2. 1269 warnings = 1064 + 135 + 35 + 18 + 8 + 5 + 2 + 1 + 1.)

None of this is new breakage — the error count has never moved off 13. These are **pre-existing
debt surfaced by newly added rules**, deliberately at warning severity so they flag drift without
failing anything.

### Checking the delta against a 1269-warning baseline

Comparing repo-wide totals is useless at this size — one edit shifts the count and you cannot
tell whose it was. **Check the files you touched instead:**

```bash
npx eslint --fix <the files you changed>   # clears their formatting + 55 Tailwind warnings
npx eslint <the files you changed>         # then read what is left
```

A file you edited should come back with **zero `prettier/prettier` warnings** — those are always
mechanically fixable, so any that survive `--fix` mean you skipped the step. Tailwind warnings
that remain need a human to pick the right rounded value; fix the ones in code you wrote, and
leave the rest of the file's debt alone (see *Stay in your lane*).

This repo is on fix-as-you-go by explicit decision: no repo-wide `npm run format` sweep, because
a ~340-file formatting diff would conflict with every in-flight branch. The debt drains as files
get edited. Re-baseline the table above when it has drained meaningfully.

So the test is **the delta, not the total**. If the count went up, or a new file appeared in the
list, that is yours — fix it. If the numbers match the table, lint is cleared.

Re-baseline this table (noting the date and commit) whenever the pre-existing set genuinely
changes, so it never silently drifts into cover for new problems.

## Fix the cause, not the check

Never clear a check by silencing it:

- No `// eslint-disable*` added to make lint pass.
- No `@ts-ignore` / `@ts-expect-error` / `as any` / widening a type to make `tsc` pass.
- No deleting or commenting out the code that fails.

`npm run lint:fix` and `npm run format` are fine for genuinely mechanical fixes (import order,
spacing, quotes). Read what they changed before moving on.

## Stay in your lane

Fix what **your change** broke. Do not repair unrelated pre-existing problems from the baseline
table while you happen to be in the file — that inflates the diff and buries the actual work.
If one genuinely blocks you, say so rather than fixing it silently.

## If a check will not clear

Report it. Say which check, paste the actual output, and state what you tried. A task with a red
check is **not** done, and describing it as done — or as "done except for a small lint issue" —
is the failure mode this rule exists to prevent.
