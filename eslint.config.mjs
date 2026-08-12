import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
]);

export default eslintConfig;
