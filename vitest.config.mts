import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // CSS modules resolve to their class names, but no stylesheet is injected
    // into jsdom. Its CSS engine cannot evaluate the `clamp()` type scale this
    // project is built on, and unit tests assert behaviour rather than layout —
    // appearance is covered by the Playwright suite in a real browser.
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    restoreMocks: true,
  },
});
