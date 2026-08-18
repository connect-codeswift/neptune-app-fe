import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

// The two conventions in .cursor/rules/tailwind-v4-utilities.mdc that no plugin
// rule covers. Both are matched against raw class strings, so they also catch
// classes built in `cn()` / `clsx()` calls and in extracted `const` strings.

// Fractional px/rem pasted straight out of Figma/MCP: `gap-[9.73px]`,
// `h-[50.595px]`, `border-[0.97px]`. Round to the nearest integer, then to the
// 4px scale.
//
// `tracking-` and `leading-` are excluded on purpose: letter-spacing and
// line-height are legitimately sub-pixel, and rounding `tracking-[0.22px]` to
// `0px` would silently change the design. Half the raw matches in this repo
// were these two.
const FRACTIONAL_ARBITRARY = "(?<!tracking-|leading-)\\[-?[0-9]*\\.[0-9]+(px|rem)\\]";

// Tailwind v4 renamed the gradient utilities. `from-*` / `via-*` / `to-*` are
// unchanged.
const V3_GRADIENT = "bg-gradient-to-";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Scoped to the files that actually call `useReactTable` — every violation
    // of this rule in the repo is one of these. Left on everywhere else so a
    // genuinely incompatible library still gets reported.
    files: ["src/components/ui/Table.tsx", "src/components/**/*Table.tsx"],
    rules: {
      // TanStack Table's useReactTable returns unstable function identities —
      // the React Compiler correctly skips memoizing those call sites.
      "react-hooks/incompatible-library": "off",
    },
  },
  {
    // Tailwind v4 conventions. Everything here is a warning, never an error:
    // these flag drift from the house style, they do not block a build.
    files: ["src/**/*.{ts,tsx}"],
    plugins: { tailwindcss: tailwind },
    settings: {
      tailwindcss: {
        // Mandatory for the v4 plugin: there is no tailwind.config.js, the
        // theme is `@theme inline` inside globals.css.
        cssConfigPath: "./src/app/globals.css",
      },
    },
    rules: {
      // An arbitrary value that has an exact scale equivalent —
      // `h-[180px]` when `h-45` exists. Auto-fixable.
      "tailwindcss/no-unnecessary-arbitrary-value": "warn",
      // Mutually exclusive classes on one element (`px-2 px-4`). Real bugs.
      "tailwindcss/no-contradicting-classname": "warn",
      // `-translate-x-[85%]` should be `translate-x-[-85%]`.
      "tailwindcss/enforces-negative-arbitrary-values": "warn",
      // v4 moved the important marker to the end: `flex!`, not `!flex`.
      "tailwindcss/important-modifier-suffix": "warn",

      // Deliberately OFF — measured against this codebase, each would bury the
      // signal above rather than add to it. Turn one on only with a plan to
      // clear it.
      //
      // classnames-order (8955 warnings): prettier-plugin-tailwindcss already
      //   sorts classes, and prettier/prettier below reports the result as a
      //   warning. Two sorters would fight.
      // no-arbitrary-value (1514): bans every arbitrary value. Our own
      //   convention explicitly keeps them for genuinely off-grid sizes.
      // enforces-shorthand (217): `h-4 w-4` -> `size-4`. Sound, but not part
      //   of the written convention.
      // no-custom-classname (208): flags this project's own CSS classes.
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-arbitrary-value": "off",
      "tailwindcss/enforces-shorthand": "off",
      "tailwindcss/no-custom-classname": "off",

      "no-restricted-syntax": [
        "warn",
        {
          selector: `Literal[value=/${FRACTIONAL_ARBITRARY}/]`,
          message:
            "Fractional px/rem from Figma/MCP. Round to the nearest integer, then to the Tailwind 4px scale (h-[180px] -> h-45). Sub-pixel borders are `border`, not `border-[0.97px]`.",
        },
        {
          selector: `TemplateElement[value.raw=/${FRACTIONAL_ARBITRARY}/]`,
          message:
            "Fractional px/rem from Figma/MCP. Round to the nearest integer, then to the Tailwind 4px scale (h-[180px] -> h-45). Sub-pixel borders are `border`, not `border-[0.97px]`.",
        },
        {
          selector: `Literal[value=/${V3_GRADIENT}/]`,
          message:
            "Tailwind v4 renamed gradients: use bg-linear-to-* instead of bg-gradient-to-*. from-*/via-*/to-* are unchanged.",
        },
        {
          selector: `TemplateElement[value.raw=/${V3_GRADIENT}/]`,
          message:
            "Tailwind v4 renamed gradients: use bg-linear-to-* instead of bg-gradient-to-*. from-*/via-*/to-* are unchanged.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Static assets are served verbatim, not authored here. Without this the
    // vendored pdf.js worker (public/pdf.worker.min.mjs, ~1MB minified) is
    // linted as source and reports well over a thousand problems.
    "public/**",
  ]),
  // Switches off every ESLint rule that would fight Prettier. Must come before
  // the block below, which re-adds Prettier as a reporting rule.
  prettier,
  {
    // Report formatting drift as ESLint warnings, so it shows up inline in the
    // editor and in `npm run lint` rather than only via `prettier --check`.
    //
    // This also covers Tailwind class ORDER, because .prettierrc loads
    // prettier-plugin-tailwindcss — which is why tailwindcss/classnames-order
    // stays off above. `npx eslint --fix` and `npm run format` both clear these.
    //
    // Note: ESLint only lints ts/tsx here, so CSS/JSON/MD formatting is still
    // `npm run format`'s job alone.
    files: ["src/**/*.{ts,tsx}"],
    plugins: { prettier: prettierPlugin },
    rules: { "prettier/prettier": "warn" },
  },
]);

export default eslintConfig;
