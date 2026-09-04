import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Most of what is worth testing here is pure, and standing up jsdom costs far
    // more than those tests take to run. Files that need a DOM opt in with a
    // `@vitest-environment jsdom` docblock.
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // .next holds built copies of the same modules; running them tests the build
    // output, not the source.
    exclude: ["node_modules/**", ".next/**"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/**/*.test.{ts,tsx}"],
    },
  },
});
