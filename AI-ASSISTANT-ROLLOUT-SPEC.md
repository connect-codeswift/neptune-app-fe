# Spec — roll `AiTextAssistant` out to the remaining prose textareas

Repo: `connect-codeswift/neptune-ehss-fe` (`neptune-app-fe`). Branch from `origin/dev`, work on
`hamid`, PR into `dev`. Next.js 16 App Router · React 19 (React Compiler **on** — do not add
`useMemo`/`useCallback`/`memo` for performance) · TypeScript · Tailwind v4 · TanStack Query v5.

There are no tests. `npm run build` is the real typecheck. Verify with `npx tsc --noEmit -p
tsconfig.json`, `npm run lint`, `npm run build` — all three must be clean.

---

## 1. What already exists — read this before writing anything

`src/components/ai/AiTextAssistant.tsx` renders two buttons (**Proofread**, **Paraphrase**)
absolutely positioned in the bottom-right of a long-text field. Do not rebuild it, do not fork
it, do not change its API. Read its doc comment first.

```tsx
<AiTextAssistant
  module="incident"        // "incident" | "nearMiss" | "hazard"
  value={someText}
  onApply={setSomeText}
  onAssisted={() => …}     // optional: fired when a rewrite is accepted
  onRegenerateDraft={…}    // optional: report forms only
  disabled={…}
/>
```

Behaviour that matters for this task:

- It is **absolutely positioned**. It needs a positioned ancestor (`relative z-0`) and the
  textarea must use `FIELD_TEXTAREA_WITH_CONTROLS_CLASS` (from
  `src/components/ui/field-styles.ts`) instead of `FIELD_TEXTAREA_CLASS`, so typed text does not
  run underneath the buttons. Getting this wrong is the most likely visual bug.
- Both buttons go through one `useRewriteMutation(module)`
  (`src/hooks/use-ai-text-mutations.ts`) → `rewriteText()`
  (`src/services/ai-text.service.ts`). One mutation covers both operations on purpose, so a
  field can never have two rewrites racing an answer into it.
- Under 20 characters (`MIN_CHARS`) the buttons are disabled.
- A rewrite is applied with an **Undo**, valid only while the field still holds exactly what was
  written (`value === appliedText`).
- Every failure is flattened to one toast — "The assistant is unavailable right now." The real
  cause goes to the console only (`AiAssistError.diagnostic`). Do not surface backend text.

### The three module endpoint trios

`MODULE_PATHS` in `src/services/ai-text.service.ts`:

| `module` | proofread | paraphrase | draft-assist |
| --- | --- | --- | --- |
| `incident` | `/incidents/ai/proofread` | `/incidents/ai/paraphrase` | `/incidents/ai/draft-assist` |
| `nearMiss` | `/near-misses/ai/proofread` | `/near-misses/ai/paraphrase` | `/near-misses/ai/draft-assist` |
| `hazard` | `/hazards/ai/proofread` | `/hazards/ai/paraphrase` | `/hazards/ai/draft-assist` |

**The `module` prop is not cosmetic.** Two reasons, both documented in the service:

1. **Permissions.** Each trio is gated server-side on that module's `.Create` permission, and
   the Incident endpoints do not accept `Ehs_Associate`. Pointing a hazard field at
   `/incidents/ai/*` 403s a user who is allowed to submit the form.
2. **Tense.** A near miss is over (past tense); a hazard still exists (present tense). Sending
   hazard text to the near-miss endpoint returns "a large puddle of oil *was* under the press",
   which reads as already dealt with.

Rate limit is **20 assist calls/min per user, shared across all three modules and all three
operations**. Client timeout 45s against a 30s server ceiling.

### The two wiring patterns

**(a) Plain JSX textarea** — wrap in a positioned div, swap the class, drop the component in.
Reference: `src/components/incidents/detail/closure/steps/IncidentClosureStepRootCause.tsx`
(lines ~155–175) and `src/components/capa/shared/CapaFormSteps.tsx`.

```tsx
<div className="relative">
  <textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    rows={3}
    className={FIELD_TEXTAREA_WITH_CONTROLS_CLASS}
  />
  <AiTextAssistant module="incident" value={value} onApply={setValue} />
</div>
```

**(b) FormBuilder schema field** — `TextareaFieldConfig` already supports an `assistant` render
prop; nothing in `form-builder/` needs changing. It receives
`TextareaAssistantField = { value, onChange }` and `FormBuilderFields.tsx` (~line 449) already
switches the textarea to `FIELD_TEXTAREA_WITH_CONTROLS_CLASS` and adds the `relative z-0`
wrapper when an assistant is present.

Reference: `src/components/near-miss/report/ReportNearMissForm.tsx` (~lines 126–160) — it maps
over the imported schema in the component and injects `assistant` for one named field. Follow
that shape; **do not put JSX in the `*-schema.ts` files** (they are plain data modules).

```tsx
const schema = useMemo<FormSchema>(
  () =>
    baseSchema.map((field) =>
      field.type === "textarea" && field.name === "whatHappened"
        ? {
            ...field,
            assistant: (control) => (
              <AiTextAssistant
                module="nearMiss"
                value={control.value}
                onApply={control.onChange}
              />
            ),
          }
        : field,
    ),
  [],
);
```

---

## 2. Scope — do exactly these nine fields

Every one of these already has a matching endpoint trio, so this is frontend-only. No backend
change, no new endpoint, no new permission.

| # | Field | File | `module` | Pattern |
| --- | --- | --- | --- | --- |
| 1 | What happened? | `src/components/near-miss/edit/EditNearMissForm.tsx` (schema field `whatHappened` in `near-miss/edit/near-miss-edit-schema.ts:113`) | `nearMiss` | b |
| 2 | Description | `src/components/hazard/edit/EditHazardForm.tsx` (schema field `description` in `hazard/edit/hazard-edit-schema.ts:107`) | `hazard` | b |
| 3 | Reason for Conversion | consumer of `src/components/near-miss/convert/convert-incident-schema.ts:44` (`reasonForConversion`) | `nearMiss` | b |
| 4 | Verification Notes | consumer of `src/components/capa/detail/capa-verification-schema.ts:66` (`notes`) | `incident` | b |
| 5 | Incident description | `src/components/incidents/detail/details/EditIncidentDetailsModal.tsx` | `incident` | a |
| 6 | Preventive actions | `src/components/incidents/detail/closure/steps/IncidentClosureStepPreventive.tsx` | `incident` | a |
| 7 | HRCA cell text | `src/components/incidents/detail/investigations/hrca/HrcaCellModal.tsx` | `incident` | a |
| 8 | RCA narrative | `src/components/capa/detail/CapaRcaContent.tsx` | `incident` | a |
| 9 | Completion review notes | `src/components/incidents/shared/capa/CapaCompletionReviewModal.tsx` | `incident` | a |

Notes on individual items:

- **3, 4, 5, 9** are modals. Confirm the buttons are not clipped by the modal's own
  `overflow` and are not painted over by a stacking context — several modals in this repo use
  `backdrop-blur`, which creates one. If a menu/button is buried, the fix used elsewhere is to
  portal, not to raise `z-index`.
- **6, 8, 9** are compliance records. Pass **rewrite only** — do **not** pass
  `onRegenerateDraft`. There is no endpoint that invents a root cause or a preventive action,
  and a model writing one from nothing would be worse than a blank field. The reasoning is
  already spelled out in a comment in `IncidentClosureStepRootCause.tsx:158-163`; keep to it.
- **7** HRCA cells are short. Check the cell textarea is tall enough that the buttons do not
  overlap the caret at the default row count; raise `rows` rather than shrinking the buttons.
- For **4** the CAPA module has no endpoint trio of its own; `incident` is the correct one and
  is what `capa/shared/CapaFormSteps.tsx` already uses.

### Explicitly out of scope

Do not touch these, and do not "helpfully" extend the work:

- Anything needing a **new backend endpoint**: BBS (`observation-form-schema.ts:61`,
  `observation-edit-schema.ts:125`), LOTO (`loto-procedure-form-schema.ts:73,128,137`),
  Walk & Talk (`walk-talk-form-schema.ts:83`), PPE (`issue-ppe-form-schema.ts:77`,
  `replacement-request-schema.ts:80`), HazCom training (`hazcom-training-schema.ts:133`),
  HazCom risk assessment (`HazcomRiskAssessmentForm.tsx:170,260`), Industrial Hygiene
  (`ih-create-sampling-plan-data.ts:77,150`, `ih-log-result-data.ts:187`,
  `ih-add-agent-data.ts:155`), Policy Maker (`EditDocumentForm.tsx`,
  `AcknowledgeCommentsCard.tsx:35`). Borrowing `/incidents/ai/*` for these would 403 users
  without `Incident.Create` and return wrong-tense text.
- Not prose, so no assistant: HazCom SDS Hazard/Precautionary Statement
  (`hazcom-sds-schema.ts:156,165` — H/P codes), `ChemicalForm.tsx` Additional Notes,
  `HazcomLabelSettingsPanel.tsx`, audit and inspection template Descriptions
  (`create-template-schema.ts:72` in both), the incident response-note and CAPA comment boxes
  (`IncidentDetailView.tsx:372`, `CapaDetailTabsPanels.tsx:610` — short activity-log entries),
  `IncidentDetailSummaryCard.tsx:40` (read-only).
- `src/components/hazcom/shared/HazcomFormField.tsx` has no assistant slot. Leave it alone —
  adding one is only worth doing when HazCom gets its own endpoints.

---

## 3. House rules you must follow

From `AGENTS.md` and the repo's Sonar config:

- **`Readonly` props (S6759).** Every component under `src/components/` takes one `props`
  parameter typed `Readonly<XProps>`, with the props type itself wrapped in `Readonly<…>`.
- **No nested ternaries (S3358).** A ternary must never appear inside another ternary's
  branches. Extract a lookup `Record`, a named `const`, or a `resolveX` helper with early
  returns. `npm run lint` does not catch this; SonarLint does.
- **Tailwind v4, no config file.** Tokens live in `@theme inline` in `src/app/globals.css` and
  carry the `ehs-` prefix. Never hardcode a hex that a token already covers, and never paste
  fractional Figma px — round to the 4px scale.
- **Do not add `useMemo`/`useCallback`/`memo` for performance** — React Compiler is on. (The
  `useMemo` around a mapped schema in the reference file exists for referential stability of the
  schema array, not speed; match the existing file's style.)
- Comments explain *why*, not *what*. Match the density and voice of the file you are editing —
  this codebase comments decisions and trade-offs, not syntax.
- Icons are `@iconify/react`; toasts go through `src/lib/toast.ts`, never `sonner` directly.

## 4. Definition of done

1. All nine fields render Proofread and Paraphrase, correctly positioned, not clipped, not
   overlapping typed text at any width down to 360px.
2. Each passes the correct `module` per the table. Verify against `MODULE_PATHS` — a wrong
   module is a 403 or wrong-tense output, and neither shows up at build time.
3. Undo appears after applying a rewrite, and disappears once the field is edited on top.
4. No new files unless one is genuinely needed. No changes to `AiTextAssistant.tsx`,
   `ai-text.service.ts`, `use-ai-text-mutations.ts`, or `form-builder/`.
5. `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npm run build` all clean. `npm run
   lint` currently reports one pre-existing warning in
   `src/components/capa/detail/CapaDetailHeader.tsx` (`'isClosed' is assigned a value but never
   used`) — that one is the accepted baseline; introduce nothing else.
6. One commit, one-line message, no mention of the tool that wrote it. PR into `dev`.

## 5. Manual check

The dev server proxies `/api` to staging (`next.config.ts` → `API_PROXY_TARGET`), so the
endpoints are live. Type 20+ characters of deliberately messy prose into each field, press both
buttons, and confirm: a result arrives in a few seconds, Undo restores the original, and a
near-miss field comes back past tense while a hazard field stays present tense. If every field
fails identically with the same toast, check the console diagnostic — a 503 means `Ai__ApiKey`
is unset on that environment and is not your bug.
