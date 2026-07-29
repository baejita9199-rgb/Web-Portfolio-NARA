#!/usr/bin/env node
/**
 * Measures the numbers this project actually claims: LCP, CLS, transfer weight
 * and what is requested on first load.
 *
 * This is not Lighthouse. It does not produce a score, and it does not simulate
 * a slow device — it reports what the page genuinely does in a real Chromium,
 * so the figures in docs/PERFORMANCE.md can be recorded rather than asserted.
 *
 * Usage:
 *   npm run build && npm run start &
 *   node scripts/measure-performance.mjs [--base http://127.0.0.1:3000]
 */

import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const BASE =
  baseIndex >= 0 ? args[baseIndex + 1] : "http://127.0.0.1:3000";

/*
 * Mirrors playwright.config.ts: the container this project was built in
 * provisions Chromium system-wide, but on a normal machine that path does not
 * exist and Playwright must resolve its own managed download instead. Passing
 * the path unconditionally made this script unrunnable anywhere else.
 */
const SYSTEM_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = existsSync(SYSTEM_CHROMIUM) ? SYSTEM_CHROMIUM : undefined;

const PROFILES = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 412, height: 915 }, hasTouch: true },
];

const ROUTES = [
  "/",
  "/journal",
  "/journal/on-building-with-quiet-materials",
  "/rooms/forest-room",
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

/**
 * Collects Largest Contentful Paint and the accumulated layout shift, using the
 * same PerformanceObserver entries the browser reports to field tooling.
 */
const VITALS_SCRIPT = `
  window.__vitals = { lcp: 0, cls: 0, shifts: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__vitals.lcp = Math.max(window.__vitals.lcp, entry.startTime);
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Shifts caused by a user interaction do not count against CLS.
      if (entry.hadRecentInput) continue;
      window.__vitals.cls += entry.value;
      window.__vitals.shifts.push({
        value: entry.value,
        sources: (entry.sources || []).map((source) =>
          source.node ? source.node.nodeName + (source.node.className ? '.' + String(source.node.className).split(' ')[0] : '') : '?',
        ),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
`;

async function measure(browser, profile, route) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    hasTouch: profile.hasTouch ?? false,
  });
  const page = await context.newPage();
  await page.addInitScript(VITALS_SCRIPT);

  const requests = [];
  page.on("response", async (response) => {
    const request = response.request();
    let size = 0;
    try {
      size = Number((await response.headerValue("content-length")) ?? 0);
    } catch {
      size = 0;
    }
    requests.push({
      url: response.url(),
      type: request.resourceType(),
      status: response.status(),
      size,
    });
  });

  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // Let the entrance settle so any late shift is included in CLS.
  await page.waitForTimeout(1500);

  const vitals = await page.evaluate(() => window.__vitals);
  const timing = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType("navigation");
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    return {
      fcp: paint ? paint.startTime : null,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
    };
  });

  const byType = {};
  let total = 0;
  for (const request of requests) {
    byType[request.type] = (byType[request.type] ?? 0) + request.size;
    total += request.size;
  }

  const videos = requests.filter((r) => r.url.includes("/video/"));
  const failures = requests.filter((r) => r.status >= 400);

  await context.close();

  return { vitals, timing, byType, total, videos, failures, count: requests.length };
}

async function main() {
  const browser = await chromium.launch({
    executablePath,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });

  const budgets = { lcp: 2500, cls: 0.1 };
  let failed = false;

  for (const profile of PROFILES) {
    console.log(`\n${"=".repeat(62)}\n${profile.name.toUpperCase()}  (${profile.viewport.width}×${profile.viewport.height})\n${"=".repeat(62)}`);

    for (const route of ROUTES) {
      const result = await measure(browser, profile, route);
      const lcpOk = result.vitals.lcp <= budgets.lcp;
      const clsOk = result.vitals.cls <= budgets.cls;
      if (!lcpOk || !clsOk || result.failures.length > 0) failed = true;

      console.log(`\n  ${route}`);
      console.log(
        `    LCP ${result.vitals.lcp.toFixed(0)} ms ${lcpOk ? "✓" : "✗ over budget"}` +
          `   CLS ${result.vitals.cls.toFixed(4)} ${clsOk ? "✓" : "✗ over budget"}` +
          `   FCP ${result.timing.fcp?.toFixed(0) ?? "?"} ms`,
      );
      console.log(
        `    ${result.count} requests, ${kb(result.total)} declared` +
          `  (${Object.entries(result.byType)
            .filter(([, size]) => size > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([type, size]) => `${type} ${kb(size)}`)
            .join(", ")})`,
      );
      console.log(
        `    video requested on load: ${
          result.videos.length === 0
            ? "none"
            : result.videos.map((v) => v.url.split("/").pop()).join(", ")
        }`,
      );

      if (result.vitals.shifts.length > 0) {
        const worst = result.vitals.shifts
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);
        console.log(
          `    largest shifts: ${worst
            .map((s) => `${s.value.toFixed(4)} (${s.sources.join(", ") || "?"})`)
            .join("; ")}`,
        );
      }

      if (result.failures.length > 0) {
        console.log(
          `    FAILED REQUESTS: ${result.failures
            .map((f) => `${f.status} ${f.url}`)
            .join(", ")}`,
        );
      }
    }
  }

  await browser.close();
  console.log(
    `\nBudgets — LCP ≤ ${budgets.lcp} ms, CLS ≤ ${budgets.cls}. ${failed ? "SOME MEASUREMENTS ARE OVER BUDGET." : "All within budget."}\n`,
  );
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
