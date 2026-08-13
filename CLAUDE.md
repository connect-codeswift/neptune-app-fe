# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository. The rules live in `AGENTS.md` so
every agent — Claude Code, Cursor, Codex — reads the same file. Edit `AGENTS.md`, not this.

@AGENTS.md

## Claude-specific

- `.claude/skills/api-integration/` covers the repeatable job here: wiring a backend endpoint
  through DTO → service → mapper → hook → component.
- Verify with `npm run lint` and `npm run build`. There are no tests; `build` is the typecheck.
- The API contract lives in `connect-codeswift/Neptune-Ehss-BE` under `FEGuides/`. Read the guide
  before wiring an endpoint rather than inferring shapes from a component.
