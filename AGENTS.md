<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Tailwind utilities (v4)

## MCP / Figma sizes

Never paste fractional MCP values (`12.75`, `9.73`, `29.19`, …). Round to the nearest integer px, then use the closest Tailwind scale utility (1 unit = 4px). Near-1px borders → `border`, not `border-[0.97px]`.

## Spacing

Do not use arbitrary pixel/rem utilities when a spacing-scale class exists.

- Prefer: `h-45`, `w-12`, `p-4`, `gap-2` (1 unit = 4px / 0.25rem)
- Avoid: `h-[180px]`, `w-[48px]`, `min-w-[12rem]`

Convert `Npx` → `N/4` (e.g. `h-[180px]` → `h-45`) and `Nrem` → `N*4` (e.g. `min-w-[12rem]` → `min-w-48`). Only keep arbitrary values when the size is off the 4px grid.

## Gradients

Use `bg-linear-to-*` (not `bg-gradient-to-*`).

- Prefer: `bg-linear-to-t`, `bg-linear-to-b`, `bg-linear-to-r`
- Avoid: `bg-gradient-to-t`, `bg-gradient-to-b`, `bg-gradient-to-r`
