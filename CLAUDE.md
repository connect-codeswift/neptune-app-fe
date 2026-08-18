# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository. The rules live in `AGENTS.md` so
every agent — Claude Code, Cursor, Codex — reads the same file. Edit `AGENTS.md`, not this.

@AGENTS.md

## Claude-specific

Every skill under `.claude/skills/` is mirrored by a Cursor rule of the same name under
`.cursor/rules/`, and the two bodies are kept identical — **edit both, or neither**:

| Skill                    | Cursor rule                 | Covers                                                                 |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------- |
| `api-integration/`       | `api-integration.mdc`       | Wiring an endpoint: DTO → service → mapper → hook → Content component  |
| `react-readonly-props/`  | `react-readonly-props.mdc`  | `Readonly<XProps>` on every component (Sonar S6759)                    |
| `tailwind-v4-utilities/` | `tailwind-v4-utilities.mdc` | Spacing scale, rounding Figma/MCP px, `bg-linear-to-*`                 |
| `verify-before-done/`    | `verify-before-done.mdc`    | Fan out typecheck / lint / build across three agents; loop until clear |

Cursor has no rule mirroring `AGENTS.md` itself; Cursor agents should read `AGENTS.md` directly,
as Claude does through this file.

Also:

- Verify with `npm run lint` and `npm run build`. There are no tests; `build` is the typecheck.
- The API contract lives in `connect-codeswift/Neptune-Ehss-BE` under `FEGuides/`. Read the guide
  before wiring an endpoint rather than inferring shapes from a component.
