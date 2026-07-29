import { defineConfig, devices } from "@playwright/test";

import { existsSync } from "node:fs";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * This image provisions Chromium system-wide rather than through
 * `playwright install`, and its build number will not always match the one the
 * installed @playwright/test expects. When the provisioned binary is present it
 * is used directly; otherwise Playwright resolves its own managed download.
 */
const SYSTEM_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = existsSync(SYSTEM_CHROMIUM) ? SYSTEM_CHROMIUM : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    launchOptions: {
      executablePath,
      // Ambient clips are muted, which browsers already allow to autoplay; this
      // simply removes any timing dependence on that policy in CI.
      args: ["--autoplay-policy=no-user-gesture-required"],
    },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-chromium",
      use: {
        /*
         * A hand-rolled phone profile rather than `devices["Pixel 7"]`.
         *
         * The provisioned Chromium is an older build than this Playwright
         * expects, and under `isMobile: true` the two disagree about the visual
         * viewport: CSS lays out at 412px while `window.innerWidth` reports
         * 784px, so every click lands at the wrong coordinates. Declaring the
         * viewport directly keeps both in step. Touch input and a coarse
         * pointer are preserved, which is what the hover-gated behaviour in
         * this project actually branches on.
         */
        ...devices["Pixel 7"],
        isMobile: false,
        hasTouch: true,
        viewport: { width: 412, height: 915 },
      },
    },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
